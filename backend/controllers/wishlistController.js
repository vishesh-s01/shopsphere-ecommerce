import Wishlist from "../models/Wishlist.js";

// GET wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        items: [],
      });
    }

    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to get wishlist" });
  }
};

// ADD item
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const product = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    const exists = wishlist.items.find(
      (item) => item.productId.toString() === product.productId
    );

    if (!exists) {
      wishlist.items.push(product);
    }

    await wishlist.save();

    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to add wishlist" });
  }
};

// REMOVE item
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await wishlist.save();

    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove wishlist" });
  }
};