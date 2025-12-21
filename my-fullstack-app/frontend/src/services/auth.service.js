import apiClient from "./apiClient";

const createUserAPI = (username, email, password, full_name) => {
    const URL_API = "/v1/api/register";
    const data = {
        username,
        email,
        password,
        full_name
    }
    return apiClient.post(URL_API, data);
}

const loginAPI = (username, password) => {
  const URL_API = "/v1/api/login";
  const data = {
    username,
    password,
  };
  return apiClient.post(URL_API, data);
};

const getUsersAPI = async () => {
  const URL_API = "/v1/api/users";
  const response = await apiClient.get(URL_API);
  // Response có format { users: [...] } từ backend
  return response?.users || response || [];
};

export { createUserAPI, loginAPI, getUsersAPI };

