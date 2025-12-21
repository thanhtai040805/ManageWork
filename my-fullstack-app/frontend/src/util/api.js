import axios from "./axios.customize";

const createUserAPI = (username, email, password, full_name) => {
    const URL_API = "/v1/api/register";
    const data = {
        username,
        email,
        password,
        full_name
    }
    return axios.post(URL_API, data);
}

const loginAPI = (username, password) => {
  const URL_API = "/v1/api/login";
  const data = {
    username,
    password,
  };
  return axios.post(URL_API, data);
};

const getUsersAPI = async () => {
  const URL_API = "/v1/api/users";
  const response = await axios.get(URL_API);
  // Response có format { users: [...] } từ backend
  return response?.users || response || [];
};

export { createUserAPI, loginAPI, getUsersAPI };
