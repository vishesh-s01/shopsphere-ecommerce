import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getSellerOrders } from "../api/orderApi";

const STATUS_MOD = {
  paid: "success", pending: "warning", failed: "danger",
  refunded: "info", delivered: "success", shipped: "info",
  processing: "warning", cancelled: "danger",
};

function TableSkeleton() {
  return (
    <div className="ss-seller-orders__skeleton">
      {[1,2,3,4].map((i) => (
        <div key={i} className="ss-seller-orders__skeleton-row">
          <div className="skeleton ss-seller-orders__skeleton-cell ss-seller-orders__skeleton-cell--lg" />
          <div className="skeleton ss-seller-orders__skeleton-cell ss-seller-orders__skeleton-cell--md" />
          <div className="skeleton ss-seller-orders__skeleton-cell ss-seller-orders__skeleton-cell--sm" />
          <div className="skeleton ss-seller-orders__skeleton-cell ss-seller-orders__skeleton-cell--sm" />
          <div className="skeleton ss-seller-orders__skeleton-cell ss-seller-orders__skeleton-cell--md" />
          <div className="skeleton ss-seller-orders__skeleton-cell ss-seller-orders__skeleton-cell--sm" />
        </div>
      ))}
    </div>
  );
}

function SellerOrdersPage({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const data = await getSellerOrders();
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

      <div className="ss-seller-orders-page">

        <div className="ss-seller-orders__header">
          <div>
            <h1 className="ss-seller-orders__title">Seller Orders</h1>
            <p className="ss-seller-orders__sub">
              {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} received`}
            </p>
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : orders.length === 0 ? (
          <div className="ss-empty-state">
            <div className="ss-empty-state__icon">🗂️</div>
            <h2 className="ss-empty-state__title">No orders yet</h2>
            <p className="ss-empty-state__sub">Orders placed for your products will appear here.</p>
          </div>
        ) : (
          <div className="ss-seller-orders__table-wrap">
            <table className="ss-seller-orders__table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const payMod   = STATUS_MOD[order.paymentStatus] ?? "neutral";
                  const orderMod = STATUS_MOD[order.orderStatus]   ?? "neutral";
                  return (
                    <tr key={order._id} className="ss-seller-orders__row">
                      <td>
                        <span className="ss-seller-orders__order-id">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="ss-seller-orders__amount">
                          ₹{order.totalAmount?.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td>
                        <span className={`ss-badge ss-badge--${payMod}`}>
                          {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`ss-badge ss-badge--${orderMod}`}>
                          {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                        </span>
                      </td>
                      <td className="ss-seller-orders__date">{formatDate(order.createdAt)}</td>
                      <td>
                        <button
                          className="ss-btn ss-btn--sm ss-btn--outline"
                          onClick={() => navigate(`/seller/orders/${order._id}`)}
                        >
                          View
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </>
  );
}

export default SellerOrdersPage;