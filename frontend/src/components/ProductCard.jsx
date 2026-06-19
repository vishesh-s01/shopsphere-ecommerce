import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useCurrentUser } from "../context/UserContext";

function getMockRating(product) {
  const seed = (product._id?.charCodeAt(0) ?? 0) + (product.price ?? 0);
  return Math.min(4.9, parseFloat((3.5 + (seed % 15) / 10).toFixed(1)));
}

function getMockReviewCount(product) {
  const seed = (product._id?.charCodeAt(2) ?? 1) * 37 + (product.price ?? 100);
  return 42 + (seed % 900);
}

function StarRating({ rating }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="ss-card__stars" aria-label={`${rating} stars`}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(empty)}
    </span>
  );
}

function Toast({ message, visible, type }) {
  return createPortal(
    <div className={`ss-toast ss-toast--${type} ${visible ? "ss-toast--visible" : ""}`}>
      <span className="ss-toast__icon">{type === "success" ? "✓" : "!"}</span>
      {message}
    </div>,
    document.body
  );
}

function ProductCard({ product, onAddToCart, onEdit, onDelete }) {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [wishlisted,   setWishlisted]   = useState(false);
  const [adding,       setAdding]       = useState(false);
  const [toastMsg,     setToastMsg]     = useState("");
  const [toastType,    setToastType]    = useState("success");
  const [toastVisible, setToastVisible] = useState(false);

  const rating      = getMockRating(product);
  const reviewCount = getMockReviewCount(product);
  const isSeller    = currentUser?.role === "seller";
  const isOwner     = currentUser?.auth0Id === product.sellerId;
  const displayName = product.title ?? product.name ?? "Unnamed Product";

  const idSum = product._id
    ? product._id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    : 0;
  const discountPct   = 10 + ((idSum + Math.floor(product.price ?? 0)) % 26);
  const originalPrice = Math.round((product.price * (1 + discountPct / 100)) / 10) * 10;
  const inStock       = product.stock > 0;

  const showToast = useCallback((msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  }, []);

  const goToDetails = useCallback(
    (e) => { e?.stopPropagation(); navigate(`/products/${product._id}`); },
    [navigate, product._id]
  );

  const handleAddToCart = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (adding || !inStock) return;
      setAdding(true);
      try {
        console.log("PRODUCT SENT TO CART:", product);
        await onAddToCart(product);
        const short = displayName.length > 28 ? displayName.slice(0, 28) + "…" : displayName;
        showToast(`"${short}" added to cart!`, "success");
      } catch {
        showToast("Couldn't add to cart. Try again.", "error");
      } finally {
        setAdding(false);
      }
    },
    [adding, inStock, onAddToCart, product, displayName, showToast]
  );

  return (
    <>
      <Toast message={toastMsg} visible={toastVisible} type={toastType} />

      <div className="ss-card" onClick={goToDetails}>

        {/* Wishlist */}
        <button
          className={`ss-card__wishlist${wishlisted ? " ss-card__wishlist--active" : ""}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted((w) => !w); }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Discount badge */}
        <div className="ss-card__discount-badge">−{discountPct}%</div>

        {/* Image */}
        <div className="ss-card__image-wrap">
          <img
            src={product.image}
            alt={displayName}
            className="ss-card__image"
            loading="lazy"
          />
          <div className="ss-card__overlay" onClick={(e) => e.stopPropagation()}>
            <button className="ss-card__quick-view" onClick={goToDetails}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Quick View
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="ss-card__body">
          <span className="ss-card__category">{product.category || "General"}</span>
          <h3 className="ss-card__title" title={displayName}>{displayName}</h3>
          <p className="ss-card__desc">{product.description}</p>

          <div className="ss-card__rating">
            <StarRating rating={rating} />
            <span className="ss-card__rating-score">{rating}</span>
            <span className="ss-card__rating-count">({reviewCount.toLocaleString()})</span>
          </div>

          <div className="ss-card__footer">
            <div className="ss-card__pricing">
              <span className="ss-card__price">₹{product.price?.toLocaleString("en-IN")}</span>
              <span className="ss-card__price-original">₹{originalPrice.toLocaleString("en-IN")}</span>
              <span className={`ss-card__stock${!inStock ? " ss-card__stock--out" : ""}`}>
                {inStock ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <button
              className={`ss-card__atc${adding ? " ss-card__atc--loading" : ""}${!inStock ? " ss-card__atc--disabled" : ""}`}
              onClick={handleAddToCart}
              disabled={adding || !inStock}
            >
              {!inStock ? "Out of Stock" : adding ? (
                <span className="ss-card__atc-spinner" />
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Seller actions */}
          {isSeller && isOwner && (
            <div className="ss-card__seller-actions">
              <button
                className="ss-card__seller-btn ss-card__seller-btn--edit"
                onClick={(e) => { e.stopPropagation(); onEdit(product); }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
              <button
                className="ss-card__seller-btn ss-card__seller-btn--delete"
                onClick={(e) => { e.stopPropagation(); onDelete(product._id); }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default ProductCard;