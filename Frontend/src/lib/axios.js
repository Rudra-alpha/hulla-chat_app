import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "https://hulla-chat-app-7-backend.onrender.com/api", // <-- backend render URL
  withCredentials: true,
});
