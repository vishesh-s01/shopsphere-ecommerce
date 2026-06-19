import { useState } from "react";
import { createPortal } from "react-dom";
import { createProduct } from "../api/productApi";
import { useCurrentUser } from "../context/UserContext";
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

function AddProductModal({ isOpen, onClose, onProductAdded }) {
  const { currentUser } = useCurrentUser();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    price: "",
    stock: "",
    category: "",
  });

  const [loading, setLoading]         = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const showSuccessToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const data = new FormData();
      data.append("title",       formData.title);
      data.append("description", formData.description);
      data.append("price",       formData.price);
      data.append("stock",       formData.stock);
      data.append("category",    formData.category);
      data.append("sellerName",  currentUser?.name);
      data.append("image",       formData.image);

      await createProduct(data);

      // Show toast, refresh list, then close modal
      showSuccessToast();
      onProductAdded();

      setTimeout(() => {
        onClose();
        setFormData({ title: "", description: "", image: "", price: "", stock: "", category: "" });
      }, 1200);

    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast message="Product added successfully!" visible={toastVisible} />

      <div className="modal-overlay">
        <div className="modal-card">
          <h2>Add Product</h2>

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

            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, image: e.target.files[0] }))
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
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={loading}>
                {loading ? "Adding…" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddProductModal;