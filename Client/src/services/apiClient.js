import axios from "axios";
import { queryClient } from "../app/queryClient";
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true
});


apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== "/auth/me") {
      queryClient.setQueryData(["me"], null);
    }
    return Promise.reject(error);
  }
);


export default apiClient;