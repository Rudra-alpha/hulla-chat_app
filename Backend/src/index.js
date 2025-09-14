import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoute.js";
import messageRoutes from "./routes/messageRoute.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const __dirname = path.resolve();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist", "index.html"));
  });
}

// Health check
app.get("/", (req, res) => {
  res.send("✅ Server is running");
});

// Start server after DB connection
const PORT = process.env.PORT || 5001;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
