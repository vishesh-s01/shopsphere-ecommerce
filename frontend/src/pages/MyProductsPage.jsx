import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getMyProducts, deleteProduct } from "../api/productApi";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";

function Toast({ message, visible, type = "success" }) {
  return createPortal(
    <div className={`ss-toast ss-toast--${type} ${visible ? "ss-toast--visible" : ""}`}>
      <span className="ss-toast__icon">{type === "success" ? "✓" : "!"}</span>
      {message}
    </div>,
    document.body
  );
}

function MyProductsPage({ darkMode, toggleDarkMode }) {
  const [products, setProducts]             = useState([]);
  const [loading,  setLoading]              = useState(true);
  const [showAddModal, setShowAddModal]     = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toastMsg, setToastMsg]             = useState("");
  const [toastType, setToastType]           = useState("success");
  const [toastVisible, setToastVisible]     = useState(false);

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const data = await getMyProducts();
      setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(productId);
      await fetchProducts();
      showToast("Product deleted successfully!", "success");
    } catch {
      showToast("Failed to delete product.", "error");
    }
  };

  return (
    <>
      <Toast message={toastMsg} visible={toastVisible} type={toastType} />
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="ss-myproducts-page">

        <div className="ss-myproducts__header">
          <div>
            <h1 className="ss-myproducts__title">My Products</h1>
            <p className="ss-myproducts__sub">
              {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""} listed`}
            </p>
          </div>

          {/* Add Product button moved here from ProductsPage */}
          <button
            className="ss-products__add-btn"
            onClick={() => setShowAddModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </button>
        </div>

        {loading ? (
          <div className="ss-products__grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ss-skeleton-card">
                <div className="skeleton ss-skeleton-card__img" />
                <div className="ss-skeleton-card__body">
                  <div className="skeleton ss-skeleton-card__line ss-skeleton-card__line--sm" />
                  <div className="skeleton ss-skeleton-card__line ss-skeleton-card__line--lg" />
                  <div className="skeleton ss-skeleton-card__line ss-skeleton-card__line--md" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="ss-empty-state">
            <div className="ss-empty-state__icon">📦</div>
            <h2 className="ss-empty-state__title">No products yet</h2>
            <p className="ss-empty-state__sub">Click "Add Product" to list your first item.</p>
          </div>
        ) : (
          <div className="ss-products__grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => {}}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}

      </div>

      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={fetchProducts}
      />
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedProduct(null); }}
        product={selectedProduct}
        onProductUpdated={fetchProducts}
      />
    </>
  );
}

export default MyProductsPage;