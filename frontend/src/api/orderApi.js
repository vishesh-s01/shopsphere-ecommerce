import api from "./axios";

export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getSellerOrders = async () => {
  const response = await api.get("/orders/seller/all");
  return response.data;
};

export const updateOrderStatus = async (
  orderId,
  orderStatus) => {
  const response = await api.put(
    `/orders/${orderId}/status`,
    {
      orderStatus,
    }
  );

  return response.data;
};

export const getSellerOrderById = async (id) => {
  const response = await api.get(
    `/orders/seller/${id}`
  );

  return response.data;
};

