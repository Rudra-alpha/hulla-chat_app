import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // REPLACE the sendMessage function in useChatStore:
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;

    try {
      // Create temporary message for immediate UI update
      const tempMessage = {
        _id: Date.now().toString(), // temporary ID
        senderId: authUser._id,
        receiverId: selectedUser._id,
        text: messageData.text,
        image: messageData.image,
        createdAt: new Date(),
        isTemp: true, // mark as temporary
      };

      // Update UI immediately
      set({ messages: [...messages, tempMessage] });

      // Send via socket for real-time delivery
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("sendMessage", {
          receiverId: selectedUser._id,
          senderId: authUser._id,
          text: messageData.text,
          image: messageData.image,
        });
      }

      // Also send via HTTP API for database persistence
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // Replace temporary message with real one from database
      set({
        messages: messages.map((msg) =>
          msg._id === tempMessage._id ? res.data : msg
        ),
      });
    } catch (error) {
      // Remove temporary message on error
      set({
        messages: messages.filter((msg) => msg._id !== tempMessage._id),
      });
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  // 🔧 FIXED: Simplified message subscription logic
  // REPLACE the subscribeToMessages function:
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.log("❌ No socket available for message subscription");
      return;
    }

    console.log("🔔 Subscribing to messages for user:", selectedUser._id);

    // Remove existing listener to prevent duplicates
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      console.log("📩 New message received:", newMessage);

      const { selectedUser: currentSelectedUser, messages } = get();
      const currentUserId = useAuthStore.getState().authUser?._id;

      // Check if message belongs to current conversation
      const isMessageRelevant =
        (newMessage.senderId === currentSelectedUser?._id &&
          newMessage.receiverId === currentUserId) ||
        (newMessage.senderId === currentUserId &&
          newMessage.receiverId === currentSelectedUser?._id);

      if (isMessageRelevant) {
        // Prevent duplicate messages (check by ID or content + timestamp)
        const messageExists = messages.some(
          (msg) =>
            msg._id === newMessage._id ||
            (msg.text === newMessage.text &&
              Math.abs(
                new Date(msg.createdAt) - new Date(newMessage.createdAt)
              ) < 1000)
        );

        if (!messageExists) {
          console.log("✅ Adding new message to state");
          set({
            messages: [...messages, newMessage],
          });
        } else {
          console.log("⚠️ Duplicate message ignored");
        }
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
