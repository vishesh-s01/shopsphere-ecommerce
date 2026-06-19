import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProductById } from "../api/productApi";
import { addToCart } from "../api/cartApi";

/* ── Toast notification ── */
function Toast({ message, type, visible }) {
  return (
    <div className={`pd-toast ${type} ${visible ? "visible" : ""}`}>
      <span className="pd-toast-icon">{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

/* ── Star rating display ── */
function Stars({ rating }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="pd-stars">
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(empty)}
    </span>
  );
}

/* ── Skeleton ── */
function ProductDetailSkeleton() {
  return (
    <div className="pd-card">
      <div className="pd-image">
        <div className="skeleton pd-skeleton-main-img" />
        <div className="pd-skeleton-thumbs">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton pd-skeleton-thumb" />
          ))}
        </div>
      </div>
      <div className="pd-content pd-skeleton-content">
        <div className="skeleton pd-skeleton-line-xs" />
        <div className="skeleton pd-skeleton-line-xl" />
        <div className="skeleton pd-skeleton-line-lg" />
        <div className="skeleton pd-skeleton-line-md" />
        <div className="skeleton pd-skeleton-line-price" />
        <div className="skeleton pd-skeleton-line-sm" />
        <div className="skeleton pd-skeleton-line-sm" />
        <div className="skeleton pd-skeleton-line-md" />
        <div className="pd-skeleton-actions">
          <div className="skeleton pd-skeleton-btn-main" />
          <div className="skeleton pd-skeleton-btn-icon" />
        </div>
      </div>
    </div>
  );
}

function ProductDetailsPage({ darkMode, toggleDarkMode }) {  const { id } = useParams();
  const navigate = useNavigate();

  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [quantity,   setQuantity]   = useState(1);
  const [adding,     setAdding]     = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [toast,      setToast]      = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const fetchProduct = useCallback(async () => {
    try {
      const data = await getProductById(id);
      setProduct(data.product);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  useEffect(() => {
  if (product?.stock === 0) {
    setQuantity(0);
  }

  if (product?.stock > 0 && quantity === 0) {
    setQuantity(1);
  }
}, [product]);

  const increaseQty = () => {
    if (quantity < (product?.stock ?? 99)) setQuantity((q) => q + 1);
  };
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

const handleAddToCart = async () => {
  if (adding) return;

  if (product.stock <= 0) {
    showToast(
      "Product is out of stock",
      "error"
    );
    return;
  }

  if (quantity > product.stock) {
    showToast(
      `Only ${product.stock} items available`,
      "error"
    );
    return;
  }

  setAdding(true);

  try {
    await addToCart(product._id, quantity);

    showToast(
      `"${product.title}" added to cart!`,
      "success"
    );
  } catch (error) {
    console.error(error);

    showToast(
      error?.response?.data?.message ||
      "Failed to add to cart",
      "error"
    );
  } finally {
    setAdding(false);
  }
};

  /* Deterministic rating & price */
  const rating = product
    ? Math.min(4.9, parseFloat((3.5 + (((product._id?.charCodeAt(0) ?? 0) + product.price) % 15) / 10).toFixed(1)))
    : 4.2;
  const reviewCount = product
    ? 42 + (((product._id?.charCodeAt(2) ?? 1) * 37 + product.price) % 900)
    : 0;
  const discountPct = product
    ? 15 + ((product._id?.charCodeAt(1) ?? 5) % 16)
    : 20;
  const originalPrice = product
    ? Math.round(product.price * (1 + discountPct / 100) / 10) * 10
    : 0;

  /* ── LOADING ── */
  if (loading) {
    return (
      <>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div className="pd-page">
          <div className="pd-breadcrumb">
            <div className="skeleton pd-skeleton-breadcrumb" />
          </div>
          <ProductDetailSkeleton />
        </div>
      </>
    );
  }

  /* ── NOT FOUND ── */
  if (!product) {
    return (
      <>
<Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />        <div className="cart-empty">
          <div className="cart-empty-icon">📦</div>
          <h2>Product not found</h2>
          <p>This product may have been removed or doesn't exist.</p>
          <button className="cart-empty-btn" onClick={() => navigate("/products")}>
            Back to Products
          </button>
        </div>
      </>
    );
  }

  return (
    <>
<Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="pd-page">

        {/* ── BREADCRUMB ── */}
        <div className="pd-breadcrumb">
          <span onClick={() => navigate("/products")}>Home</span>
          <span className="sep">›</span>
          <span onClick={() => navigate("/products")}>{product.category || "Products"}</span>
          <span className="sep">›</span>
          <span className="current">{product.title}</span>
        </div>

        {/* ── MAIN CARD ── */}
        <div className="pd-card">

          {/* IMAGE COLUMN */}
          <div className="pd-image">
            <div className="pd-image-main">
              <img src={product.image} alt={product.title} />
            </div>
            <button className="pd-back-btn" onClick={() => navigate("/products")}>
              ← Back to Products
            </button>
          </div>

          {/* CONTENT COLUMN */}
          <div className="pd-content">

            <p className="pd-category">{product.category}</p>

            <h1 className="pd-title">{product.title}</h1>

            {/* Rating row */}
            <div className="pd-rating-row">
              <Stars rating={rating} />
              <span className="pd-rating-value">{rating}</span>
              <span className="pd-rating-count">({reviewCount.toLocaleString()} ratings)</span>
              <span className="badge badge-success">Verified</span>
            </div>

            {/* Price block */}
            <div className="pd-price-block">
              <div className="pd-price-row">
                <span className="pd-price">₹{product.price?.toLocaleString("en-IN")}</span>
                <span className="pd-price-original">₹{originalPrice.toLocaleString("en-IN")}</span>
                <span className="pd-discount-badge">{discountPct}% OFF</span>
              </div>
              <p className="pd-tax-note">Inclusive of all taxes</p>
            </div>

            {/* Stock */}
            <p className={`pd-stock ${product.stock === 0 ? "out" : ""}`}>
              {product.stock > 0
                ? `In Stock — Only ${product.stock} left`
                : "Out of Stock"}
            </p>

            <p className="pd-description">{product.description}</p>

            {/* Quantity */}
            <div className="pd-qty">
              <label>Qty:</label>
              <div className="qty-box">
                <button onClick={decreaseQty} aria-label="Decrease quantity">−</button>
                <span>{quantity}</span>
                <button
                  onClick={increaseQty}
                  disabled={quantity >= product.stock}
                  className={quantity >= product.stock ? "qty-disabled" : ""}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <p className="pd-total">
              Total: <span>₹{(product.price * quantity).toLocaleString("en-IN")}</span>
            </p>

            {/* Action buttons */}
            <div className="pd-actions">
              <button
                className={`pd-cart-btn ${product.stock === 0 ? "pd-cart-btn-disabled" : ""}`}
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
              >
                {adding ? "Adding…" : product.stock === 0 ? "Out of Stock" : "🛒  Add to Cart"}
              </button>

              <button
                className={`pd-wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
                onClick={() => setWishlisted((w) => !w)}
                title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                {wishlisted ? "❤️" : "🤍"}
              </button>
            </div>

            {/* Feature chips */}
            <div className="pd-features">
              {[
                { icon: "🚚", text: "Free Delivery" },
                { icon: "↩️", text: "7-Day Returns" },
                { icon: "✅", text: "1 Year Warranty" },
                { icon: "🔒", text: "Secure Payment" },
              ].map((f) => (
                <div key={f.text} className="pd-feature">
                  <span className="pd-feature-icon">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </>
  );
}

export default ProductDetailsPage;