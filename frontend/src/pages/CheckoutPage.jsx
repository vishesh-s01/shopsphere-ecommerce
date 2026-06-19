import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCart } from "../api/cartApi";
import axios from "../api/axios";

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <span className="ss-field-error">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {msg}
    </span>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="ss-checkout">
      <div className="ss-checkout__left">
        <div className="skeleton ss-checkout__skeleton-block" style={{ height: 200 }} />
        <div className="skeleton ss-checkout__skeleton-block" style={{ height: 320 }} />
      </div>
      <div className="ss-checkout__right">
        <div className="skeleton ss-checkout__skeleton-block" style={{ height: 400 }} />
      </div>
    </div>
  );
}

function CheckoutPage({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [cart,    setCart]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [errors,  setErrors]  = useState({});

  const [address, setAddress] = useState({
    name: "", phone: "", email: "", city: "",
    state: "", pincode: "", fullAddress: "",
  });

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!address.name.trim())             e.name        = "Full name is required";
    if (!/^\d{10}$/.test(address.phone))  e.phone       = "Enter a valid 10-digit number";
    if (address.email && !/\S+@\S+\.\S+/.test(address.email)) e.email = "Enter a valid email";
    if (!address.city.trim())             e.city        = "City is required";
    if (!/^\d{6}$/.test(address.pincode)) e.pincode     = "Enter a valid 6-digit pincode";
    if (!address.fullAddress.trim())      e.fullAddress = "Address is required";
    return e;
  };

  const handlePlaceOrder = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      document.querySelector(".ss-field-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPlacing(true);
    try {
      const res = await axios.post("/payment/checkout", { shippingAddress: address });
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const subtotal    = cart?.items?.reduce((a, i) => a + i.price * i.quantity, 0) ?? 0;
  const deliveryFee = subtotal > 499 ? 0 : 49;
  const discount    = Math.round(subtotal * 0.05);
  const grandTotal  = subtotal - discount + deliveryFee;

  if (loading) return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <CheckoutSkeleton />
    </>
  );

  if (!cart || cart.items.length === 0) return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="ss-empty-state">
        <div className="ss-empty-state__icon">🛒</div>
        <h2 className="ss-empty-state__title">Your cart is empty</h2>
        <p className="ss-empty-state__sub">Add items before checking out</p>
        <button className="ss-btn ss-btn--primary" onClick={() => navigate("/products")}>
          Continue Shopping
        </button>
      </div>
    </>
  );

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="ss-checkout">

        {/* ── LEFT ── */}
        <div className="ss-checkout__left">

          {/* Step 1 — Order Summary */}
          <div className="ss-checkout__section">
            <div className="ss-checkout__section-header">
              <span className="ss-checkout__step-num">1</span>
              <h2 className="ss-checkout__section-title">Order Summary</h2>
            </div>

            <div className="ss-checkout__items">
              {cart.items.map((item) => (
                <div key={item.productId} className="ss-checkout__item">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="ss-checkout__item-img"
                  />
                  <div className="ss-checkout__item-info">
                    <h4 className="ss-checkout__item-title">{item.title}</h4>
                    <p className="ss-checkout__item-meta">
                      Qty: {item.quantity} &nbsp;·&nbsp; ₹{item.price?.toLocaleString("en-IN")} each
                    </p>
                  </div>
                  <span className="ss-checkout__item-price">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="ss-checkout__subtotal">
              <span>Subtotal</span>
              <span>₹{cart.totalAmount?.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Step 2 — Delivery Address */}
          <div className="ss-checkout__section">
            <div className="ss-checkout__section-header">
              <span className="ss-checkout__step-num">2</span>
              <h2 className="ss-checkout__section-title">Delivery Address</h2>
            </div>

            <div className="ss-form-row">
              <div className="ss-form-group">
                <label className="ss-form-label">Full Name <span className="ss-form-required">*</span></label>
                <input
                  className={`ss-form-input${errors.name ? " ss-form-input--error" : ""}`}
                  name="name"
                  placeholder="Rahul Sharma"
                  value={address.name}
                  onChange={handleChange}
                />
                <FieldError msg={errors.name} />
              </div>
              <div className="ss-form-group">
                <label className="ss-form-label">Phone Number <span className="ss-form-required">*</span></label>
                <input
                  className={`ss-form-input${errors.phone ? " ss-form-input--error" : ""}`}
                  name="phone"
                  placeholder="9876543210"
                  value={address.phone}
                  onChange={handleChange}
                  maxLength={10}
                />
                <FieldError msg={errors.phone} />
              </div>
            </div>

            <div className="ss-form-group">
              <label className="ss-form-label">Email Address <span className="ss-form-optional">(optional)</span></label>
              <input
                className={`ss-form-input${errors.email ? " ss-form-input--error" : ""}`}
                name="email"
                type="email"
                placeholder="rahul@email.com"
                value={address.email}
                onChange={handleChange}
              />
              <FieldError msg={errors.email} />
            </div>

            <div className="ss-form-row">
              <div className="ss-form-group">
                <label className="ss-form-label">City <span className="ss-form-required">*</span></label>
                <input
                  className={`ss-form-input${errors.city ? " ss-form-input--error" : ""}`}
                  name="city"
                  placeholder="Mumbai"
                  value={address.city}
                  onChange={handleChange}
                />
                <FieldError msg={errors.city} />
              </div>
              <div className="ss-form-group">
                <label className="ss-form-label">State</label>
                <input
                  className="ss-form-input"
                  name="state"
                  placeholder="Maharashtra"
                  value={address.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="ss-form-group ss-form-group--narrow">
              <label className="ss-form-label">Pincode <span className="ss-form-required">*</span></label>
              <input
                className={`ss-form-input${errors.pincode ? " ss-form-input--error" : ""}`}
                name="pincode"
                placeholder="400001"
                value={address.pincode}
                onChange={handleChange}
                maxLength={6}
              />
              <FieldError msg={errors.pincode} />
            </div>

            <div className="ss-form-group">
              <label className="ss-form-label">Full Address <span className="ss-form-required">*</span></label>
              <textarea
                className={`ss-form-textarea${errors.fullAddress ? " ss-form-input--error" : ""}`}
                name="fullAddress"
                placeholder="House/Flat no., Street name, Landmark…"
                value={address.fullAddress}
                onChange={handleChange}
                rows={3}
              />
              <FieldError msg={errors.fullAddress} />
            </div>
          </div>

        </div>

        {/* ── RIGHT — Price Summary ── */}
        <div className="ss-checkout__right">
          <div className="ss-checkout__summary">
            <h3 className="ss-checkout__summary-title">Price Details</h3>

            <div className="ss-checkout__summary-rows">
              <div className="ss-checkout__summary-row">
                <span>Price ({cart.items.length} item{cart.items.length > 1 ? "s" : ""})</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="ss-checkout__summary-row ss-checkout__summary-row--discount">
                <span>Discount (5%)</span>
                <span>−₹{discount.toLocaleString("en-IN")}</span>
              </div>
              <div className="ss-checkout__summary-row">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? "ss-checkout__free-delivery" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
            </div>

            <div className="ss-checkout__grand-total">
              <span>Total Amount</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>

            {discount > 0 && (
              <div className="ss-checkout__savings-badge">
                🎉 You save ₹{discount.toLocaleString("en-IN")} on this order!
              </div>
            )}

            <button
              className={`ss-checkout__pay-btn${placing ? " ss-checkout__pay-btn--loading" : ""}`}
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <>
                  <span className="ss-spinner ss-spinner--sm" />
                  Redirecting to Payment…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Proceed to Payment
                </>
              )}
            </button>

            <div className="ss-checkout__secure-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              100% Secure · Powered by Stripe
            </div>

            <div className="ss-checkout__payment-methods">
              {["Visa", "Mastercard", "UPI", "Wallets"].map((m) => (
                <span key={m} className="ss-checkout__payment-chip">{m}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default CheckoutPage;