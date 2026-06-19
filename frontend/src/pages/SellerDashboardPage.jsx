import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerAnalytics } from "../api/analyticsApi";
import {
    LineChart, Line, BarChart, Bar,
    CartesianGrid, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const fmt = (n) => Number(n ?? 0).toLocaleString("en-IN");
const fmtShort = (n) => {
    n = Number(n ?? 0);
    if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
    if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(1)}L`;
    if (n >= 1_000)       return `₹${(n / 1_000).toFixed(1)}k`;
    return `₹${n}`;
};

const statusClass = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("deliver") || s.includes("complet")) return "ss-badge--success";
    if (s.includes("cancel")  || s.includes("fail"))    return "ss-badge--danger";
    if (s.includes("pending") || s.includes("process")) return "ss-badge--warning";
    if (s.includes("ship")    || s.includes("transit")) return "ss-badge--info";
    return "ss-badge--neutral";
};

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

/* ── Sparkline mini chart (7-day trend indicator) ── */
const Sparkline = ({ data = [], color = "#2563eb" }) => {
    if (!data.length) return null;
    const vals = data.map(Number);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const W = 80, H = 32, pad = 2;
    const pts = vals
        .map((v, i) => {
            const x = pad + (i / (vals.length - 1)) * (W - pad * 2);
            const y = H - pad - ((v - min) / range) * (H - pad * 2);
            return `${x},${y}`;
        })
        .join(" ");
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

/* ── Revenue chart tooltip ── */
const RevenueTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="sd-tooltip">
            <p className="sd-tooltip__label">{label}</p>
            <p className="sd-tooltip__val">₹{fmt(payload[0].value)}</p>
        </div>
    );
};

/* ── Bar chart tooltip ── */
const BarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="sd-tooltip">
            <p className="sd-tooltip__label">{label}</p>
            <p className="sd-tooltip__val">{payload[0].value} orders</p>
        </div>
    );
};

/* ── Progress bar ── */
const ProgressBar = ({ value, max, color = "var(--accent)" }) => {
    const w = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div className="sd-progress">
            <div className="sd-progress__fill" style={{ width: `${w}%`, background: color }} />
        </div>
    );
};

/* ── Stat delta badge (growth indicator) ── */
const Delta = ({ value }) => {
    if (value === undefined || value === null) return null;
    const up = value >= 0;
    return (
        <span className={`sd-delta ${up ? "sd-delta--up" : "sd-delta--down"}`}>
            {up ? "▲" : "▼"} {Math.abs(value)}%
        </span>
    );
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
function SellerDashboardPage() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading]     = useState(true);
    const [chartTab, setChartTab]   = useState("revenue"); // "revenue" | "orders"
    const [greeting, setGreeting]   = useState("Good day");

    useEffect(() => {
        const h = new Date().getHours();
        if (h < 12) setGreeting("Good morning");
        else if (h < 17) setGreeting("Good afternoon");
        else setGreeting("Good evening");
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const data = await getSellerAnalytics();
            setAnalytics(data.analytics);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* Derived data */
    const revenueData = useMemo(() =>
        Object.entries(analytics?.monthlyRevenue || {}).map(([month, revenue]) => ({
            month, revenue,
        })), [analytics]);

    const orderTrendData = useMemo(() =>
        Object.entries(analytics?.monthlyOrders || {}).map(([month, orders]) => ({
            month, orders,
        })), [analytics]);

    /* Order status pie data */
    const PIE_COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#0284c7", "#94a3b8"];
    const pieData = useMemo(() =>
        Object.entries(analytics?.orderStatusStats || {}).map(([name, value]) => ({
            name: name.replaceAll("_", " "), value,
        })), [analytics]);

    /* Delivery rate */
    const deliveryRate = useMemo(() =>
        pct(analytics?.deliveredOrders, analytics?.totalOrders),
    [analytics]);

    /* Fulfilment health score (simple composite) */
    const healthScore = useMemo(() => {
        if (!analytics) return 0;
        const dr = deliveryRate;
        const cancelRate = pct(
            (analytics.orderStatusStats?.cancelled || 0),
            analytics.totalOrders
        );
        return Math.max(0, Math.min(100, Math.round(dr - cancelRate * 0.5)));
    }, [analytics, deliveryRate]);

    const healthLabel = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : "Needs attention";
    const healthColor = healthScore >= 80 ? "var(--success)" : healthScore >= 60 ? "var(--accent)" : healthScore >= 40 ? "var(--warning)" : "var(--danger)";

    /* ── Loading ── */
    if (loading) return (
        <div className="sd-page">
            <div className="skeleton" style={{ height: 100, borderRadius: "var(--radius-xl)", marginBottom: 24 }} />
            <div className="sd-kpi-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 104, borderRadius: "var(--radius-lg)" }} />
                ))}
            </div>
            <div className="sd-body">
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="skeleton" style={{ height: 320, borderRadius: "var(--radius-lg)" }} />
                    <div className="skeleton" style={{ height: 260, borderRadius: "var(--radius-lg)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="skeleton" style={{ height: 220, borderRadius: "var(--radius-lg)" }} />
                    <div className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />
                    <div className="skeleton" style={{ height: 160, borderRadius: "var(--radius-lg)" }} />
                </div>
            </div>
        </div>
    );

    if (!analytics) return (
        <div className="sd-page">
            <div className="ss-empty-state">
                <div className="ss-empty-state__icon">📊</div>
                <p className="ss-empty-state__title">Couldn't load dashboard</p>
                <p className="ss-empty-state__sub">Check your connection and try again.</p>
                <button className="ss-btn ss-btn--primary" onClick={fetchAnalytics}>Retry</button>
            </div>
        </div>
    );

    /* ── KPI cards config ── */
    const kpiCards = [
        {
            label: "Total revenue",
            value: fmtShort(analytics.revenue),
            raw: `₹${fmt(analytics.revenue)}`,
            icon: "💰",
            variant: "accent",
            trend: [40, 55, 48, 72, 65, 88, analytics.revenue / 10000],
            delta: analytics.revenueGrowth ?? null,
        },
        {
            label: "Today's revenue",
            value: fmtShort(analytics.todayRevenue),
            raw: `₹${fmt(analytics.todayRevenue)}`,
            icon: "📅",
            variant: "default",
            trend: null,
        },
        {
            label: "This month",
            value: fmtShort(analytics.monthRevenue),
            raw: `₹${fmt(analytics.monthRevenue)}`,
            icon: "📆",
            variant: "default",
            delta: analytics.monthGrowth ?? null,
        },
        {
            label: "Avg order value",
            value: fmtShort(analytics.averageOrderValue),
            raw: `₹${fmt(analytics.averageOrderValue)}`,
            icon: "📈",
            variant: "default",
        },
        {
            label: "Total orders",
            value: fmt(analytics.totalOrders),
            icon: "🛒",
            variant: "default",
            onClick: () => navigate("/seller/orders"),
        },
        {
            label: "Delivered",
            value: fmt(analytics.deliveredOrders),
            icon: "✅",
            variant: "success",
            sub: `${deliveryRate}% delivery rate`,
            onClick: () => navigate("/seller/orders"),
        },
        {
            label: "Pending",
            value: fmt(analytics.pendingOrders),
            icon: "⏳",
            variant: "warning",
            onClick: () => navigate("/seller/orders"),
        },
        {
            label: "Products listed",
            value: fmt(analytics.totalProducts),
            icon: "📦",
            variant: "default",
            onClick: () => navigate("/seller/products"),
        },
    ];

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    return (
        <div className="sd-page">

            {/* ══ HEADER ══ */}
            <div className="sd-header">
                <div className="sd-header__left">
                    <p className="sd-header__greeting">{greeting}, Seller 👋</p>
                    <h1 className="sd-header__title">Seller Dashboard</h1>
                    <p className="sd-header__date">{today}</p>
                </div>
                <div className="sd-header__right">
                    {/* Quick health pill */}
                    <div className="sd-health-pill">
                        <span className="sd-health-pill__dot" style={{ background: healthColor }} />
                        <span className="sd-health-pill__label">Store health:</span>
                        <span className="sd-health-pill__score" style={{ color: healthColor }}>
                            {healthLabel}
                        </span>
                    </div>
                    <div className="sd-header__actions">
                        <button className="ss-btn ss-btn--outline ss-btn--sm sd-btn-light"
                            onClick={() => navigate("/seller/orders")}>
                            View orders
                        </button>
                        <button className="ss-btn ss-btn--primary ss-btn--sm"
                            onClick={() => navigate("/seller/products")}>
                            + Add product
                        </button>
                    </div>
                </div>
            </div>

            {/* ══ KPI GRID ══ */}
            <div className="sd-kpi-grid">
                {kpiCards.map((card) => (
                    <div
                        key={card.label}
                        className={`sd-kpi sd-kpi--${card.variant}${card.onClick ? " sd-kpi--clickable" : ""}`}
                        onClick={card.onClick}
                        role={card.onClick ? "button" : undefined}
                        tabIndex={card.onClick ? 0 : undefined}
                        onKeyDown={card.onClick ? (e) => e.key === "Enter" && card.onClick() : undefined}
                        title={card.raw || undefined}
                    >
                        <div className="sd-kpi__top">
                            <span className="sd-kpi__icon" aria-hidden="true">{card.icon}</span>
                            <span className="sd-kpi__label">{card.label}</span>
                            {card.onClick && <span className="sd-kpi__arrow" aria-hidden="true">→</span>}
                        </div>
                        <p className="sd-kpi__value">{card.value}</p>
                        <div className="sd-kpi__bottom">
                            {card.sub && <span className="sd-kpi__sub">{card.sub}</span>}
                            {card.delta !== undefined && card.delta !== null && <Delta value={card.delta} />}
                            {card.trend && (
                                <span className="sd-kpi__spark">
                                    <Sparkline data={card.trend} color={
                                        card.variant === "success" ? "#16a34a" :
                                        card.variant === "warning" ? "#d97706" : "#2563eb"
                                    } />
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ══ ALERT BANNER (pending orders nudge) ══ */}
            {analytics.pendingOrders > 0 && (
                <div className="sd-alert">
                    <span className="sd-alert__icon">⚠️</span>
                    <p className="sd-alert__text">
                        You have <strong>{analytics.pendingOrders}</strong> pending order{analytics.pendingOrders !== 1 ? "s" : ""} waiting to be processed.
                    </p>
                    <button className="sd-alert__btn" onClick={() => navigate("/seller/orders")}>
                        Process now →
                    </button>
                </div>
            )}

            {/* ══ MAIN BODY ══ */}
            <div className="sd-body">

                {/* ── LEFT column ── */}
                <div className="sd-body__left">

                    {/* Revenue + Orders tabbed chart */}
                    <section className="sd-card">
                        <div className="sd-card__header">
                            <div className="sd-tabs">
                                <button
                                    className={`sd-tab${chartTab === "revenue" ? " sd-tab--active" : ""}`}
                                    onClick={() => setChartTab("revenue")}
                                >
                                    Revenue trend
                                </button>
                                <button
                                    className={`sd-tab${chartTab === "orders" ? " sd-tab--active" : ""}`}
                                    onClick={() => setChartTab("orders")}
                                >
                                    Order volume
                                </button>
                            </div>
                            <span className="sd-card__badge">Last 12 months</span>
                        </div>

                        <div className="sd-chart-wrap">
                            {chartTab === "revenue" ? (
                                revenueData.length === 0 ? (
                                    <div className="sd-empty"><span>📉</span><p>No data yet.</p></div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={revenueData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                                            <Tooltip content={<RevenueTooltip />} />
                                            <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5}
                                                dot={{ r: 3.5, fill: "#2563eb", strokeWidth: 0 }}
                                                activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )
                            ) : (
                                orderTrendData.length === 0 ? (
                                    <div className="sd-empty"><span>📦</span><p>No data yet.</p></div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={orderTrendData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<BarTooltip />} />
                                            <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )
                            )}
                        </div>
                    </section>

                    {/* Recent orders table */}
                    <section className="sd-card">
                        <div className="sd-card__header">
                            <h2 className="sd-card__title">Recent orders</h2>
                            <button className="sd-card__link" onClick={() => navigate("/seller/orders")}>
                                See all →
                            </button>
                        </div>
                        {!analytics.recentOrders?.length ? (
                            <div className="sd-empty"><span>📭</span><p>No orders yet.</p></div>
                        ) : (
                            <div className="sd-table-wrap">
                                <table className="sd-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                            <th>Date</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.recentOrders.map((order) => (
                                            <tr key={order._id}>
                                                <td className="sd-table__id">#{order._id.slice(-8)}</td>
                                                <td>
                                                    <span className={`ss-badge ${statusClass(order.orderStatus)}`}>
                                                        {order.orderStatus.replaceAll("_", " ")}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`ss-badge ${order.paymentStatus === "paid" ? "ss-badge--success" : "ss-badge--warning"}`}>
                                                        {order.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="sd-table__date">
                                                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                        day: "2-digit", month: "short", year: "numeric",
                                                    })}
                                                </td>
                                                <td>
                                                    <button className="sd-view-btn"
                                                        onClick={() => navigate(`/seller/orders/${order._id}`)}>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>

                {/* ── RIGHT column ── */}
                <div className="sd-body__right">

                    {/* Store health score */}
                    <section className="sd-card">
                        <div className="sd-card__header">
                            <h2 className="sd-card__title">Store health</h2>
                        </div>
                        <div className="sd-health">
                            <div className="sd-health__score-wrap">
                                <svg viewBox="0 0 100 100" className="sd-health__ring" aria-label={`Health score ${healthScore}`}>
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke={healthColor} strokeWidth="8"
                                        strokeDasharray={`${healthScore * 2.513} 251.3`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)" />
                                    <text x="50" y="46" textAnchor="middle" dominantBaseline="middle"
                                        style={{ fontSize: 20, fontWeight: 700, fill: healthColor, fontFamily: "var(--font-display)" }}>
                                        {healthScore}
                                    </text>
                                    <text x="50" y="63" textAnchor="middle" dominantBaseline="middle"
                                        style={{ fontSize: 9, fill: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                                        /100
                                    </text>
                                </svg>
                                <div className="sd-health__label-wrap">
                                    <p className="sd-health__verdict" style={{ color: healthColor }}>{healthLabel}</p>
                                    <p className="sd-health__hint">Based on delivery &amp; cancellation rates</p>
                                </div>
                            </div>
                            <div className="sd-health__metrics">
                                <div className="sd-health__row">
                                    <span className="sd-health__metric-label">Delivery rate</span>
                                    <span className="sd-health__metric-val">{deliveryRate}%</span>
                                </div>
                                <ProgressBar value={deliveryRate} max={100} color="var(--success)" />
                                <div className="sd-health__row" style={{ marginTop: 10 }}>
                                    <span className="sd-health__metric-label">Orders fulfilled</span>
                                    <span className="sd-health__metric-val">{analytics.deliveredOrders} / {analytics.totalOrders}</span>
                                </div>
                                <ProgressBar value={analytics.deliveredOrders} max={analytics.totalOrders} color="var(--accent)" />
                            </div>
                        </div>
                    </section>

                    {/* Order status breakdown with pie */}
                    <section className="sd-card">
                        <div className="sd-card__header">
                            <h2 className="sd-card__title">Order breakdown</h2>
                        </div>
                        {pieData.length === 0 ? (
                            <div className="sd-empty"><span>📊</span><p>No data.</p></div>
                        ) : (
                            <div className="sd-pie-wrap">
                                <ResponsiveContainer width="100%" height={170}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                                            dataKey="value" paddingAngle={2}>
                                            {pieData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v, name) => [`${v} orders`, name]} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="sd-pie-legend">
                                    {pieData.map((entry, i) => (
                                        <div key={entry.name} className="sd-pie-legend__row">
                                            <span className="sd-pie-legend__dot"
                                                style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="sd-pie-legend__name">{entry.name}</span>
                                            <span className="sd-pie-legend__val">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Top products */}
                    <section className="sd-card">
                        <div className="sd-card__header">
                            <h2 className="sd-card__title">Top products</h2>
                            <button className="sd-card__link" onClick={() => navigate("/seller/products")}>
                                Manage →
                            </button>
                        </div>
                        {!analytics.topProducts?.length ? (
                            <div className="sd-empty"><span>📦</span><p>No sales yet.</p></div>
                        ) : (
                            <ol className="sd-top-products">
                                {analytics.topProducts.map((product, idx) => {
                                    const maxSold = analytics.topProducts[0]?.sold || 1;
                                    return (
                                        <li key={product.title} className="sd-product-row">
                                            <span className={`sd-product-row__rank${idx === 0 ? " sd-product-row__rank--gold" : idx === 1 ? " sd-product-row__rank--silver" : idx === 2 ? " sd-product-row__rank--bronze" : ""}`}>
                                                {idx + 1}
                                            </span>
                                            <div className="sd-product-row__info">
                                                <span className="sd-product-row__title">{product.title}</span>
                                                <ProgressBar value={product.sold} max={maxSold} color="var(--accent)" />
                                            </div>
                                            <span className="sd-product-row__sold">{product.sold} sold</span>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </section>

                    {/* Quick actions */}
                    <section className="sd-card">
                        <div className="sd-card__header">
                            <h2 className="sd-card__title">Quick actions</h2>
                        </div>
                        <div className="sd-quick-actions">
                            <button className="sd-quick-btn" onClick={() => navigate("/seller/products")}>
                                <span className="sd-quick-btn__icon">➕</span>
                                <span>Add product</span>
                            </button>
                            <button className="sd-quick-btn" onClick={() => navigate("/seller/orders")}>
                                <span className="sd-quick-btn__icon">📋</span>
                                <span>All orders</span>
                            </button>
                            <button className="sd-quick-btn" onClick={() => navigate("/seller/orders?status=pending")}>
                                <span className="sd-quick-btn__icon">⏳</span>
                                <span>Pending</span>
                            </button>
                            <button className="sd-quick-btn" onClick={() => navigate("/seller/products")}>
                                <span className="sd-quick-btn__icon">📦</span>
                                <span>Inventory</span>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default SellerDashboardPage;