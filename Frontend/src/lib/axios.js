// ENSURE your base URL is correct:
export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api" // Should match your backend port
      : "https://your-production-url.com/api", // Update with your actual production URL
  withCredentials: true,
});
