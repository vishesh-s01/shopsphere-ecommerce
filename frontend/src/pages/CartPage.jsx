import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getCart, removeFromCart, updateCartQuantity } from "../api/cartApi";
import { useNavigate } from "react-router-dom";

function CartSkeleton() {
  return (
    <div className="ss-cart__skeleton-list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="ss-cart__skeleton-item">
          <div className="skeleton ss-cart__skeleton-img" />
          <div className="ss-cart__skeleton-info">
            <div className="skeleton ss-cart__skeleton-line ss-cart__skeleton-line--lg" />
            <div className="skeleton ss-cart__skeleton-line ss-cart__skeleton-line--sm" />
            <div className="skeleton ss-cart__skeleton-qty" />
          </div>
          <div className="skeleton ss-cart__skeleton-price" />
        </div>
      ))}
    </div>
  );
}

function CartPage({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [cart,     setCart]     = useState({ items: [], totalAmount: 0 });
  const [loading,  setLoading]  = useState(true);
  const [removing, setRemoving] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(!data || !Array.isArray(data.items) ? { items: [], totalAmount: 0 } : data);
    } catch (err) {
      console.error(err);
      setCart({ items: [], totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    window.addEventListener("focus", fetchCart);
    return () => window.removeEventListener("focus", fetchCart);
  }, []);

  const handleRemove = async (productId) => {
    setRemoving(productId);
    try {
      const res = await removeFromCart(productId);
      setCart(res?.cart ?? (await getCart()));
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(null);
    }
  };

  const updateQty = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await updateCartQuantity(productId, newQty);
      setCart(res?.cart ?? (await getCart()));
    } catch (err) {
      console.error(err);
    }
  };

  const itemCount   = cart.items.reduce((a, i) => a + i.quantity, 0);
  const subtotal    = cart.items.reduce((a, i) => a + i.price * i.quantity, 0);
  const deliveryFee = subtotal > 499 ? 0 : 49;
  const discount    = Math.round(subtotal * 0.05);
  const grandTotal  = subtotal - discount + deliveryFee;

  if (loading) return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="ss-cart-page">
        <div className="ss-cart__layout">
          <div className="ss-cart__left">
            <div className="skeleton ss-cart__skeleton-title" />
            <CartSkeleton />
          </div>
          <div className="ss-cart__right">
            <div className="skeleton ss-cart__skeleton-summary" />
          </div>
        </div>
      </div>
    </>
  );

  if (!cart.items.length) return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="ss-empty-state">
        <div className="ss-empty-state__icon">🛒</div>
        <h2 className="ss-empty-state__title">Your cart is empty</h2>
        <p className="ss-empty-state__sub">Looks like you haven't added anything yet.</p>
        <button className="ss-btn ss-btn--primary" onClick={() => navigate("/products")}>
          Continue Shopping
        </button>
      </div>
    </>
  );

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="ss-cart-page">

        <div className="ss-cart__header">
          <h1 className="ss-cart__title">Shopping Cart</h1>
          <span className="ss-cart__count">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
        </div>

        <div className="ss-cart__layout">

          {/* LEFT — Items */}
          <div className="ss-cart__left">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className={`ss-cart__item${removing === item.productId ? " ss-cart__item--removing" : ""}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="ss-cart__item-img"
                  onClick={() => navigate(`/products/${item.productId}`)}
                />

                <div className="ss-cart__item-body">
                  <span className="ss-cart__item-category">{item.category || "Product"}</span>
                  <h3 className="ss-cart__item-title">{item.title}</h3>
                  <p className="ss-cart__item-unit">Unit price: ₹{item.price?.toLocaleString("en-IN")}</p>

                  <div className="ss-cart__item-actions">
                    <div className="ss-qty">
                      <button
                        className="ss-qty__btn"
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="ss-qty__value">{item.quantity}</span>
                      <button
                        className="ss-qty__btn"
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="ss-cart__remove-btn"
                      onClick={() => handleRemove(item.productId)}
                      disabled={removing === item.productId}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                      </svg>
                      {removing === item.productId ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>

                <div className="ss-cart__item-total">
                  <span className="ss-cart__item-total-price">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                  {item.quantity > 1 && (
                    <span className="ss-cart__item-total-sub">
                      {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            ))}

            <button className="ss-cart__refresh-btn" onClick={fetchCart}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh Cart
            </button>
          </div>

          {/* RIGHT — Summary */}
          <div className="ss-cart__right">
            <div className="ss-cart__summary">
              <h3 className="ss-cart__summary-title">Order Summary</h3>

              <div className="ss-cart__summary-rows">
                <div className="ss-cart__summary-row">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="ss-cart__summary-row ss-cart__summary-row--discount">
                  <span>Discount (5%)</span>
                  <span>−₹{discount.toLocaleString("en-IN")}</span>
                </div>
                <div className="ss-cart__summary-row">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? "ss-cart__free-delivery" : ""}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>
              </div>

              {deliveryFee > 0 && (
                <div className="ss-cart__delivery-nudge">
                  🎉 Add ₹{(499 - subtotal + 1).toLocaleString("en-IN")} more for free delivery!
                </div>
              )}

              <div className="ss-cart__grand-total">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>

              <button
                className="ss-cart__checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>

              <p className="ss-cart__secure-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Secure checkout · All taxes included
              </p>

              <div className="ss-cart__trust-row">
                {["🚚 Free Returns", "✅ Warranty", "💳 Safe Pay"].map((b) => (
                  <span key={b} className="ss-cart__trust-badge">{b}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default CartPage;