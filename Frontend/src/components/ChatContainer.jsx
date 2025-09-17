import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import { Users, MessageSquare } from "lucide-react";

const HomePage = () => {
  const { authUser, socket, onlineUsers } = useAuthStore();
  const {
    selectedUser,
    messages,
    users,
    getUsers,
    getMessages,
    setSelectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  // Connect socket when user is authenticated
  useEffect(() => {
    if (authUser && !socket) {
      useAuthStore.getState().connectSocket();
    }
  }, [authUser, socket]);

  // Subscribe to real-time messages
  useEffect(() => {
    subscribeToMessages();

    // Cleanup when component unmounts
    return () => {
      unsubscribeFromMessages();
    };
  }, [subscribeToMessages, unsubscribeFromMessages]);

  // Load users on component mount
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Load messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  // Debug socket connection
  useEffect(() => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      console.log(
        "Socket status:",
        socket.connected ? "Connected" : "Disconnected"
      );
      console.log("Socket ID:", socket.id);

      // Add socket event listeners for debugging
      socket.on("connect", () => {
        console.log("✅ Socket connected successfully");
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
      });

      socket.on("connect_error", (error) => {
        console.log("❌ Socket connection error:", error.message);
      });
    }

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
      }
    };
  }, [socket]);

  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p>Please log in to access messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r border-base-300">
        <div className="p-4 border-b border-base-300">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users size={20} />
            Contacts
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {onlineUsers.length} user{onlineUsers.length !== 1 ? "s" : ""}{" "}
            online
          </p>
        </div>

        <Sidebar
          users={users}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <ChatContainer
            selectedUser={selectedUser}
            messages={messages}
            onlineUsers={onlineUsers}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
            <MessageSquare size={48} className="mb-4" />
            <h3 className="text-xl font-medium mb-2">Welcome to HulloChat</h3>
            <p>Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
