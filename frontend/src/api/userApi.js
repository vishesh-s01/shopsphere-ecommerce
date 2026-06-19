import api from "./axios";

export const syncUser = async (userData) => {
  const response = await api.post("/users/sync", userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const updateRole = async (role) => {
  const response = await api.patch("/users/role", {
    role,
  });

  return response.data;
};