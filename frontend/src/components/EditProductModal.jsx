import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { updateProduct } from "../api/productApi";
import { PRODUCT_CATEGORIES } from "../constants/categories";

function Toast({ message, visible }) {
  return createPortal(
    <div className={`ss-toast ss-toast--success ${visible ? "ss-toast--visible" : ""}`}>
      <span className="ss-toast__icon">✓</span>
      {message}
    </div>,
    document.body
  );
}

function EditProductModal({ isOpen, onClose, product, onProductUpdated }) {
  const [formData, setFormData] = useState({
    title: "", description: "", image: "",
    price: "", stock: "", category: "",
  });
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
const [existingImage, setExistingImage] = useState("");
useEffect(() => {
  if (!product) return;

  setFormData({
    title: product.title || "",
    description: product.description || "",
    price: product.price || "",
    stock: product.stock || "",
    category: product.category || "",
    image: null, // important: reset file
  });

  setExistingImage(product.image || "");
}, [product]);

  if (!isOpen || !product) return null;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
const data = new FormData();

data.append("title", formData.title);
data.append("description", formData.description);
data.append("price", formData.price);
data.append("stock", formData.stock);
data.append("category", formData.category);

// only send new image if user selects one
if (formData.image instanceof File) {
  data.append("image", formData.image);
}

      await updateProduct(product._id, data);

      setToastVisible(true);
      onProductUpdated();
      setTimeout(() => {
        setToastVisible(false);
        onClose();
      }, 1200);
    } catch (error) {
      console.error(error);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast message="Product updated successfully!" visible={toastVisible} />

      <div className="modal-overlay">
        <div className="modal-card">
          <h2>Edit Product</h2>

          <form onSubmit={handleSubmit}>
            <input
              name="title"
              placeholder="Product Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              required
            />
            {existingImage && (
  <div style={{ marginBottom: "10px" }}>
    <p>Current Image:</p>
    <img
      src={existingImage}
      alt="product"
      style={{
        width: "100px",
        height: "100px",
        objectFit: "cover",
        borderRadius: "8px",
      }}
    />
  </div>
)}

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  image: e.target.files[0],
                }))
              }
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <input
              name="stock"
              type="number"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleChange}
              required
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Category</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div className="modal-actions">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditProductModal;