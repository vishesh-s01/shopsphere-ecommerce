import axios from "./axios";

// ==============================
// ADD TO CART
// ==============================
export const addToCart = async (productId, quantity = 1) => {
  const res = await axios.post("/cart", {
    productId,
    quantity,
  });

  // Broadcast instantly so Navbar badge updates without any extra API call
  window.dispatchEvent(new CustomEvent("cart-updated", { detail: res.data }));

  return res.data;
};

// ==============================
// GET CART
// ==============================
export const getCart = async () => {
  const res = await axios.get("/cart");
  return res.data;
};

// ==============================
// REMOVE ITEM FROM CART
// ==============================
export const removeFromCart = async (productId) => {
  const res = await axios.delete(`/cart/${productId}`);

  // Broadcast so Navbar badge updates instantly after removal too
  window.dispatchEvent(
    new CustomEvent("cart-updated", { detail: res.data?.cart })
  );

  return res.data;
};

// ==============================
// UPDATE CART QUANTITY
// ==============================
export const updateCartQuantity = async (productId, quantity) => {
  const res = await axios.put("/cart", {
    productId,
    quantity,
  });

  // Broadcast so Navbar badge updates instantly after qty change
  window.dispatchEvent(
    new CustomEvent("cart-updated", { detail: res.data?.cart })
  );

  return res.data;
};