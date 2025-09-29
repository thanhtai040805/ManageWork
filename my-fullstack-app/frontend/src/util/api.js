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

export { createUserAPI };
