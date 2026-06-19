import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentResult from "./pages/PaymentResult";
import ProtectedRoute from "./routes/ProtectedRoute";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import SellerOrdersPage from "./pages/SellerOrdersPage";
import SellerOrderDetailsPage from "./pages/SellerOrderDetailsPage";
import MyProductsPage from "./pages/MyProductsPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";


function AppLoader() {
  return (
    <div className="app-loader">
      <div className="app-loader-inner">
        <div className="app-loader-logo">S</div>
        <p className="app-loader-brand">ShopSphere</p>
        <div className="app-loader-bar">
          <div className="app-loader-bar-fill" />
        </div>
        <p className="app-loader-text">Getting things ready…</p>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // ── Apply data-theme directly to <html> tag ──
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <>

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/products" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetailsPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-result"
          element={
            <PaymentResult
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrdersPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailsPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute>
              <SellerOrdersPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />



        <Route
          path="/seller/orders/:id"
          element={
            <ProtectedRoute>
              <SellerOrderDetailsPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/products"
          element={
            <ProtectedRoute>
              <MyProductsPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute>
              <SellerDashboardPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />


      </Routes>
    </>
  );
}

export default App;