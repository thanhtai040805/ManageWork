import { toast } from "react-toastify";
import apiClient from "./apiClient";

const BASE_URL = "/v1/api/notifications";

/**
 * notificationService
 * A unified service for UI notifications (toasts) and Notification API calls.
 */
export const notificationService = {
  // --- UI Toasts (react-toastify) ---
  success: (message, options = {}) => {
    return toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: "top-right",
      ...options,
    });
  },

  updateLoading: (toastId, message, type = "success", options = {}) => {
    toast.update(toastId, {
      render: message,
      type: type,
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
      ...options,
    });
  },

  dismissAll: () => {
    toast.dismiss();
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  // --- API Calls ---
  getNotificationsAPI: (params) =>
    apiClient.get(`${BASE_URL}`, { params }),

  getUnreadCountAPI: () =>
    apiClient.get(`${BASE_URL}/unread-count`),

  markAsReadAPI: (id) =>
    apiClient.put(`${BASE_URL}/${id}/read`),

  markAllAsReadAPI: () =>
    apiClient.put(`${BASE_URL}/mark-all-read`)
};

export default notificationService;
