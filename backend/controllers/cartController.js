import Cart from "../models/Cart.js";
import Product from "../models/productModel.js";


export const addToCart = async (req, res) => {
  try {
    const userId = req.auth.payload.sub; // Auth0 user id
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);


console.log(product);
console.log("sellerId:", product.sellerId);
console.log("sellerName:", product.sellerName);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

if (product.stock <= 0) {
  return res.status(400).json({
    message: "Product is out of stock",
  });
}

if (quantity > product.stock) {
  return res.status(400).json({
    message: `Only ${product.stock} items available`,
  });
}
    let cart = await Cart.findOne({ userId });

    // If cart doesn't exist, create new
    if (!cart) {
      cart = new Cart({
        userId,
        items: [
          {
            productId: product._id,
            title: product.title,
            image: product.image,
            price: product.price,
            quantity: quantity || 1,

            sellerId: product.sellerId,
            sellerName: product.sellerName,
          }
        ],
      });
    } else {
      // check if product already exists in cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      const currentQty = existingItem
  ? existingItem.quantity
  : 0;

if (currentQty + quantity > product.stock) {
  return res.status(400).json({
    message: `Only ${product.stock} item(s) available`,
  });
}

      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.items.push({
          productId: product._id,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity: quantity || 1,

          sellerId: product.sellerId,
          sellerName: product.sellerName,
        });
      }
    }

    // recalculate total
    cart.totalAmount = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      message: "Added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(200).json({ items: [], totalAmount: 0 });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // recalculate total
    cart.totalAmount = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      message: "Item removed successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) => i.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;

    cart.totalAmount = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      message: "Quantity updated",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};