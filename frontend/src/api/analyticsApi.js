import api from "./axios";

export const getSellerAnalytics = async () => {
  const response = await api.get("/analytics");

  return response.data;
};