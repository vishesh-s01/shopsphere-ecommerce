import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../api/orderApi";

const ORDER_STEPS = [
  { key: "order_placed",     label: "Order Placed",      icon: "📋" },
  { key: "processing",       label: "Processing",         icon: "⚙️" },
  { key: "ready_to_ship",    label: "Ready to Ship",      icon: "📦" },
  { key: "shipped",          label: "Shipped",            icon: "🚚" },
  { key: "out_for_delivery", label: "Out for Delivery",   icon: "🛵" },
  { key: "delivered",        label: "Delivered",          icon: "✅" },
];

const STATUS_MOD = {
  paid: "success", pending: "warning", failed: "danger", refunded: "info",
};

function OrderDetailsPage({ darkMode, toggleDarkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  if (loading) return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="ss-order-details-page">
        <div className="skeleton" style={{ height: 32, width: 200, borderRadius: 8, marginBottom: 32 }} />
        <div className="ss-order-details__grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
            <div className="skeleton" style={{ height: 180, borderRadius: 16 }} />
          </div>
          <div className="skeleton" style={{ height: 360, borderRadius: 16 }} />
        </div>
      </div>
    </>
  );

  if (!order) return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="ss-empty-state">
        <div className="ss-empty-state__icon">📭</div>
        <h2 className="ss-empty-state__title">Order not found</h2>
        <button className="ss-btn ss-btn--primary" onClick={() => navigate("/my-orders")}>
          Back to Orders
        </button>
      </div>
    </>
  );

  const currentStep = ORDER_STEPS.findIndex((s) => s.key === order.orderStatus);
  const payMod = STATUS_MOD[order.paymentStatus] ?? "neutral";

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="ss-order-details-page">

        <div className="ss-order-details__back">
          <button className="ss-btn ss-btn--ghost" onClick={() => navigate("/my-orders")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to My Orders
          </button>
        </div>

        <div className="ss-order-details__hero">
          <div>
            <h1 className="ss-order-details__title">Order Details</h1>
            <p className="ss-order-details__id">#{order._id.slice(-10).toUpperCase()}</p>
          </div>
          <span className={`ss-badge ss-badge--${payMod} ss-badge--lg`}>
            {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
          </span>
        </div>

        <div className="ss-order-details__grid">

          {/* LEFT COLUMN */}
          <div className="ss-order-details__left">

            {/* Items */}
            <div className="ss-order-details__box">
              <h3 className="ss-order-details__box-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Products
              </h3>
              {order.items.map((item) => (
                <div key={item.productId} className="ss-order-details__item">
                  <img src={item.image} alt={item.title} className="ss-order-details__item-img" />
                  <div className="ss-order-details__item-info">
                    <h4 className="ss-order-details__item-title">{item.title}</h4>
                    <p className="ss-order-details__item-meta">
                      ₹{fmt(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="ss-order-details__item-price">
                    ₹{fmt(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="ss-order-details__total">
                <span>Total Paid</span>
                <span>₹{fmt(order.totalAmount)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="ss-order-details__box">
              <h3 className="ss-order-details__box-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Shipping Address
              </h3>
              <div className="ss-order-details__address">
                <p className="ss-order-details__address-name">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.phone}</p>
                {order.shippingAddress?.email && <p>{order.shippingAddress.email}</p>}
                <p>{order.shippingAddress?.fullAddress}</p>
                <p>
                  {order.shippingAddress?.city}
                  {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ""}
                  {order.shippingAddress?.pincode ? ` – ${order.shippingAddress.pincode}` : ""}
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN — Tracking */}
          <div className="ss-order-details__right">
            <div className="ss-order-details__box">
              <h3 className="ss-order-details__box-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Order Tracking
              </h3>

              <div className="ss-timeline">
                {ORDER_STEPS.map((step, index) => {
                  const done    = index < currentStep;
                  const active  = index === currentStep;
                  const pending = index > currentStep;
                  return (
                    <div
                      key={step.key}
                      className={`ss-timeline__step${done ? " ss-timeline__step--done" : ""}${active ? " ss-timeline__step--active" : ""}${pending ? " ss-timeline__step--pending" : ""}`}
                    >
                      <div className="ss-timeline__dot">
                        {done ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <span className="ss-timeline__dot-inner" />
                        )}
                      </div>
                      {index < ORDER_STEPS.length - 1 && (
                        <div className={`ss-timeline__line${done || active ? " ss-timeline__line--done" : ""}`} />
                      )}
                      <div className="ss-timeline__content">
                        <span className="ss-timeline__icon">{step.icon}</span>
                        <span className="ss-timeline__label">{step.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment summary */}
            <div className="ss-order-details__box">
              <h3 className="ss-order-details__box-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Payment Details
              </h3>
              <div className="ss-order-details__payment-rows">
                <div className="ss-order-details__payment-row">
                  <span>Payment Status</span>
                  <span className={`ss-badge ss-badge--${payMod}`}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                  </span>
                </div>
                <div className="ss-order-details__payment-row">
                  <span>Total Amount</span>
                  <strong>₹{fmt(order.totalAmount)}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default OrderDetailsPage;  