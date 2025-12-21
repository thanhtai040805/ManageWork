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
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (response && response.data) return response.data;
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("theme_color");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      console.error("Access forbidden");
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default instance;
