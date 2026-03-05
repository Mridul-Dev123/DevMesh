import apiClient from "../../services/apiClient";

export const login = async (data) => {
  const res = await apiClient.post("/auth/login", data);
  return res.data.data;
};

export const register = async (data) => {
  const res = await apiClient.post("/auth/register", data);
  return res.data.data;
};
export const getMe = async () => {
  const res = await apiClient.get("/auth/me");
  return res.data.data;
};
export const logout = async () => {
  await apiClient.post("/auth/logout");
};