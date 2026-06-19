import { useEffect, useState } from "react";
import { getMyOrders } from "../api/orderApi";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const STATUS_MOD = {
  paid:      "success",
  pending:   "warning",
  failed:    "danger",
  refunded:  "info",
  delivered: "success",
  shipped:   "info",
  cancelled: "danger",
};

function OrderSkeleton() {
  return (
    <div className="ss-orders__skeleton-list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="ss-orders__skeleton-card">
          <div className="ss-orders__skeleton-card-left">
            <div className="skeleton ss-orders__skeleton-line ss-orders__skeleton-line--md" />
            <div className="skeleton ss-orders__skeleton-line ss-orders__skeleton-line--sm" />
            <div className="skeleton ss-orders__skeleton-line ss-orders__skeleton-line--sm" />
          </div>
          <div className="skeleton ss-orders__skeleton-badge" />
        </div>
      ))}
    </div>
  );
}

function MyOrdersPage({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    }) : "—";

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="ss-orders-page">

        <div className="ss-orders__header">
          <div>
            <h1 className="ss-orders__title">My Orders</h1>
            <p className="ss-orders__sub">Track and manage all your orders</p>
          </div>
        </div>

        {loading ? (
          <OrderSkeleton />
        ) : orders.length === 0 ? (
          <div className="ss-empty-state">
            <div className="ss-empty-state__icon">📦</div>
            <h2 className="ss-empty-state__title">No orders yet</h2>
            <p className="ss-empty-state__sub">Your placed orders will appear here.</p>
            <button className="ss-btn ss-btn--primary" onClick={() => navigate("/products")}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="ss-orders__list">
            {orders.map((order) => {
              const payMod   = STATUS_MOD[order.paymentStatus] ?? "neutral";
              const orderMod = STATUS_MOD[order.orderStatus]   ?? "neutral";

              return (
                <div
                  key={order._id}
                  className="ss-order-card"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <div className="ss-order-card__left">
                    <div className="ss-order-card__top">
                      <span className="ss-order-card__id">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="ss-order-card__date">{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="ss-order-card__meta">
                      <span className="ss-order-card__items">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </span>
                      <span className="ss-order-card__amount">
                        ₹{order.totalAmount?.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Item thumbnails */}
                    {order.items?.slice(0, 4).length > 0 && (
                      <div className="ss-order-card__thumbs">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.image}
                            alt={item.title}
                            className="ss-order-card__thumb"
                          />
                        ))}
                        {order.items.length > 4 && (
                          <span className="ss-order-card__thumb-more">+{order.items.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ss-order-card__right">
                    <span className={`ss-badge ss-badge--${payMod}`}>
                      {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                    </span>
                    <span className={`ss-badge ss-badge--${orderMod}`}>
                      {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                    </span>
                    <svg className="ss-order-card__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </>
  );
}

export default MyOrdersPage;