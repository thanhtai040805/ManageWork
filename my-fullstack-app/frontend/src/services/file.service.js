import apiClient from "./apiClient";

const uploadFileAPI = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const URL_API = "/v1/api/files/upload";
  return apiClient.post(URL_API, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export { uploadFileAPI };