import express from "express";
import dotenv from "dotenv";
import authRoutes from "./authRoute.js";
import messageRoutes from "./messageRoute.js";
import { connectDB } from "../lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "../lib/socket.js";
import path from "path";

dotenv.config();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));
  app.arguments("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "../Frontend/dist", "dist", "index.html")
    );
  });
}

app.get("/", (req, res) => {
  res.send("✅ Server is running");
});

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// ✅ Wait for DB connection before starting server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
