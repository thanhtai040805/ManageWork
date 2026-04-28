import axios from "axios";

// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8888",
});

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    console.error("Request error:", error);
    if(error?.response?.data) return error?.response?.data;
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    // Return data directly for easier consumption
    return response.data || response;
  },
  (error) => {
    // Handle 401 - Unauthorized (Token expired or invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("theme_color");

      const publicPaths = ["/login", "/register"];
      const currentPath = window.location.pathname;

      // Redirect to login only if not on a public page to avoid infinite loops
      if (!publicPaths.includes(currentPath)) {
        console.warn("Unauthorized! Redirecting to login...");
        window.location.href = "/login";
      }
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      console.error("Access forbidden: You do not have permission for this resource.");
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error: Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default instance;

