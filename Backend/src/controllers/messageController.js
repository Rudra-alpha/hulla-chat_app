export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrlFinal;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrlFinal = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrlFinal,
    });

    await newMessage.save();

    // ✅ Get receiver's socket id from map
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // ✅ Also emit to sender so they see it instantly
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
