import Product from "../models/productModel.js";
import fs from "fs";
import path from "path";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
const {
  title,
  description,
  price,
  stock,
  category,
} = req.body;

const image = req.file
  ? `http://localhost:5000/uploads/products/${req.file.filename}`
  : "";

    const product = await Product.create({
      title,
      description,
      image,
      price,
      stock,
      category,

      sellerId: req.auth.payload.sub,
      sellerName: req.body.sellerName,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.sellerId !== auth0Id) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own products",
      });
    }

    // If new image uploaded
    if (req.file) {
      // Delete old image file
      if (product.image) {
        const oldFilename = product.image.split("/").pop();

        const oldImagePath = path.join(
          process.cwd(),
          "uploads",
          "products",
          oldFilename
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      product.image = `http://localhost:5000/uploads/products/${req.file.filename}`;
    }

    product.title = req.body.title;
    product.description = req.body.description;
    product.price = req.body.price;
    product.stock = req.body.stock;
    product.category = req.body.category;

    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.sellerId !== auth0Id) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own products",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const sellerId = req.auth.payload.sub;

    const products = await Product.find({
      sellerId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};