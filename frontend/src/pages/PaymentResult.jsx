import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

function PaymentResult({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async (id) => {
    try {
      if (!id) { setLoading(false); return; }
      const res = await axios.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder(orderId);
    const interval = setInterval(() => fetchOrder(orderId), 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const STATUS_CONFIG = {
    paid:     { label: "Payment Successful",  sub: "Your order is confirmed and being prepared.",          icon: "✓", mod: "success" },
    failed:   { label: "Payment Failed",       sub: "Your payment could not be processed. Please retry.",  icon: "✕", mod: "danger"  },
    refunded: { label: "Payment Refunded",     sub: "Your refund has been initiated (5–7 business days).", icon: "↩", mod: "warning" },
    pending:  { label: "Payment Pending",      sub: "Confirming your payment. This page refreshes automatically.", icon: "…", mod: "info" },
  };

  const cfg = STATUS_CONFIG[order?.paymentStatus] ?? STATUS_CONFIG.pending;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }) : "—";

  const fmt = (n) => Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  /* ── No order ID ── */
  if (!orderId) return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="ss-empty-state">
        <div className="ss-empty-state__icon">⚠️</div>
        <h2 className="ss-empty-state__title">Invalid Session</h2>
        <p className="ss-empty-state__sub">No order ID found in this URL.</p>
        <button className="ss-btn ss-btn--primary" onClick={() => navigate("/products")}>Back to Home</button>
      </div>
    </>
  );

  /* ── Loading ── */
  if (loading) return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="ss-invoice">
        <div className="skeleton ss-invoice__skeleton-banner" />
        <div className="ss-invoice__box">
          <div className="skeleton ss-invoice__skeleton-heading" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="ss-invoice__item">
              <div className="skeleton ss-invoice__skeleton-img" />
              <div className="ss-invoice__skeleton-lines">
                <div className="skeleton ss-invoice__skeleton-line ss-invoice__skeleton-line--lg" />
                <div className="skeleton ss-invoice__skeleton-line ss-invoice__skeleton-line--md" />
              </div>
            </div>
          ))}
          <div className="skeleton ss-invoice__skeleton-total" />
        </div>
      </div>
    </>
  );

  /* ── Not found ── */
  if (!order) return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="ss-empty-state">
        <div className="ss-empty-state__icon">📭</div>
        <h2 className="ss-empty-state__title">Order Not Found</h2>
        <p className="ss-empty-state__sub">We couldn't locate this order.</p>
        <button className="ss-btn ss-btn--primary" onClick={() => navigate("/products")}>Back to Home</button>
      </div>
    </>
  );

  const subtotal = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? order.totalAmount;
  const discount = order.discount ?? 0;
  const delivery = order.deliveryFee ?? 0;

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="ss-invoice">

        {/* Status Banner */}
        <div className={`ss-invoice__banner ss-invoice__banner--${cfg.mod}`}>
          <div className={`ss-invoice__banner-icon ss-invoice__banner-icon--${cfg.mod}`}>
            {cfg.icon}
          </div>
          <div className="ss-invoice__banner-text">
            <h2 className="ss-invoice__banner-title">{cfg.label}</h2>
            <p className="ss-invoice__banner-sub">{cfg.sub}</p>
          </div>
          <span className={`ss-badge ss-badge--${cfg.mod}`}>
            {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
          </span>
        </div>

        <div className="ss-invoice__body">

          {/* Left — Items + Totals */}
          <div className="ss-invoice__main">

            <div className="ss-invoice__box">
              <div className="ss-invoice__box-header">
                <h3 className="ss-invoice__box-title">Order Summary</h3>
                <span className="ss-badge ss-badge--accent">
                  {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}
                </span>
              </div>

              {order.items?.map((item) => (
                <div key={item.productId} className="ss-invoice__item">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="ss-invoice__item-img"
                    loading="lazy"
                  />
                  <div className="ss-invoice__item-info">
                    <h4 className="ss-invoice__item-title">{item.title}</h4>
                    <p className="ss-invoice__item-meta">Qty: {item.quantity} &nbsp;·&nbsp; ₹{fmt(item.price)} each</p>
                  </div>
                  <span className="ss-invoice__item-price">₹{fmt(item.price * item.quantity)}</span>
                </div>
              ))}

              <div className="ss-invoice__price-rows">
                <div className="ss-invoice__price-row">
                  <span>Subtotal</span><span>₹{fmt(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="ss-invoice__price-row ss-invoice__price-row--discount">
                    <span>Discount</span><span>−₹{fmt(discount)}</span>
                  </div>
                )}
                <div className="ss-invoice__price-row">
                  <span>Delivery</span>
                  <span>{delivery === 0
                    ? <span className="ss-badge ss-badge--success">FREE</span>
                    : `₹${fmt(delivery)}`}
                  </span>
                </div>
              </div>

              <div className="ss-invoice__grand-total">
                <span>Total {order.paymentStatus === "paid" ? "Paid" : "Amount"}</span>
                <span>₹{fmt(order.totalAmount)}</span>
              </div>
            </div>

            {/* Failed retry box */}
            {order.paymentStatus === "failed" && (
              <div className="ss-invoice__retry-box">
                <p>Having trouble? Try a different payment method or contact support.</p>
                <button className="ss-btn ss-btn--danger" onClick={() => navigate("/cart")}>
                  Try Again
                </button>
              </div>
            )}

            {/* Trust badges */}
            {order.paymentStatus === "paid" && (
              <div className="ss-invoice__trust">
                {[
                  { icon: "🔒", label: "Secure Payment" },
                  { icon: "💳", label: "Stripe Verified" },
                  { icon: "📦", label: "Order Confirmed" },
                ].map((t) => (
                  <div key={t.label} className="ss-invoice__trust-item">
                    <span>{t.icon}</span> {t.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Order Meta */}
          <div className="ss-invoice__sidebar">
            <div className="ss-invoice__box">
              <h3 className="ss-invoice__box-title">Order Details</h3>

              <div className="ss-invoice__meta-rows">
                <div className="ss-invoice__meta-row">
                  <span className="ss-invoice__meta-label">Order ID</span>
                  <span className="ss-invoice__meta-value ss-invoice__meta-value--mono">{order._id}</span>
                </div>
                <div className="ss-invoice__meta-row">
                  <span className="ss-invoice__meta-label">Date</span>
                  <span className="ss-invoice__meta-value">{formatDate(order.createdAt)}</span>
                </div>
                <div className="ss-invoice__meta-row">
                  <span className="ss-invoice__meta-label">Status</span>
                  <span className={`ss-badge ss-badge--${cfg.mod}`}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                  </span>
                </div>
                {order.address && (
                  <div className="ss-invoice__meta-row">
                    <span className="ss-invoice__meta-label">Ship To</span>
                    <span className="ss-invoice__meta-value">
                      {order.address.name && <>{order.address.name}<br /></>}
                      {order.address.line1 && <>{order.address.line1}<br /></>}
                      {order.address.city}{order.address.pincode ? ` – ${order.address.pincode}` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="ss-invoice__cta">
              <button className="ss-btn ss-btn--primary ss-btn--full" onClick={() => navigate("/products")}>
                ← Continue Shopping
              </button>
              {order.paymentStatus === "paid" && (
                <p className="ss-invoice__cta-note">
                  A confirmation email has been sent to your registered address.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default PaymentResult;