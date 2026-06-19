import Order from "../models/Order.js";
import Product from "../models/productModel.js";

export const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.auth.payload.sub;

    const products = await Product.find({ sellerId });

    const totalProducts = products.length;

    const orders = await Order.find({
      "items.sellerId": sellerId,
    });

    let revenue = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;

    const productSales = {};

    const orderStatusStats = {
      order_placed: 0,
      processing: 0,
      ready_to_ship: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
    };

    const monthlyRevenue = {};

    const today = new Date();

    orders.forEach((order) => {
      // Order Status Analytics
      orderStatusStats[order.orderStatus]++;

      // Delivered Orders
      if (order.orderStatus === "delivered") {
        deliveredOrders++;
      }

      // Pending Orders
      if (
        order.orderStatus === "order_placed" ||
        order.orderStatus === "processing" ||
        order.orderStatus === "ready_to_ship"
      ) {
        pendingOrders++;
      }

      const orderDate = new Date(order.createdAt);

      const isToday =
        orderDate.toDateString() ===
        today.toDateString();

      const isCurrentMonth =
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() ===
          today.getFullYear();

      order.items.forEach((item) => {
        if (item.sellerId === sellerId) {
          // Revenue only from paid orders
          if (order.paymentStatus === "paid") {
            const itemRevenue =
              item.price * item.quantity;

            revenue += itemRevenue;

            if (isToday) {
              todayRevenue += itemRevenue;
            }

            if (isCurrentMonth) {
              monthRevenue += itemRevenue;
            }

            const month = orderDate
              .toISOString()
              .slice(0, 7);

            monthlyRevenue[month] =
              (monthlyRevenue[month] || 0) +
              itemRevenue;
          }

          // Product Sales Analytics
          if (!productSales[item.title]) {
            productSales[item.title] = 0;
          }

          productSales[item.title] += item.quantity;
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([title, sold]) => ({
        title,
        sold,
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    const recentOrders = orders
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);

      const averageOrderValue =
  orders.length > 0
    ? Math.round(revenue / orders.length)
    : 0;

    res.json({
      success: true,
      analytics: {
        revenue,
        todayRevenue,
        monthRevenue,
        deliveredOrders,
        totalOrders: orders.length,
        totalProducts,
        pendingOrders,
        topProducts,
        recentOrders,
        orderStatusStats,
        monthlyRevenue,
        averageOrderValue,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch analytics",
    });
  }
};