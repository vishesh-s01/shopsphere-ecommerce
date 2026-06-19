import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCart } from "../api/cartApi";
import { useAuth0 } from "@auth0/auth0-react";
import { useCurrentUser } from "../context/UserContext";

function Navbar({ onSearch, darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth0();
  const { currentUser } = useCurrentUser();

  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchCartCount = useCallback(async () => {
    try {
      const data = await getCart();
      const count = data?.items?.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count || 0);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount, location.pathname]);

  useEffect(() => {
    const handleCartUpdate = (e) => {
      const cart = e.detail;
      if (cart?.items) {
        const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      } else {
        fetchCartCount();
      }
    };
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, [fetchCartCount]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    if (location.pathname !== "/products") navigate("/products");
  };

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <nav className={`ss-nav${scrolled ? " ss-nav--scrolled" : ""}`}>
      <div className="ss-nav__inner">

        {/* LOGO */}
        <div className="ss-nav__logo" onClick={() => navigate("/products")}>
          <span className="ss-nav__logo-icon">S</span>
          <span className="ss-nav__logo-text">
            Shop<span className="ss-nav__logo-dot">Sphere</span>
          </span>
        </div>

        {/* SEARCH */}
        <form className="ss-nav__search" onSubmit={handleSearchSubmit}>
          <span className="ss-nav__search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            className="ss-nav__search-input"
            placeholder="Search products, brands and more…"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search products"
          />
          <button type="submit" className="ss-nav__search-btn">Search</button>
        </form>

        {/* RIGHT ACTIONS */}
        <div className="ss-nav__actions">

          {/* Dark mode toggle */}
          <button
            className="ss-nav__icon-btn"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Nav links */}
          <button className="ss-nav__link-btn" onClick={() => navigate("/my-orders")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            My Orders
          </button>

          {currentUser?.role === "seller" && (
            <>
              <button
                className="ss-nav__link-btn"
                onClick={() => navigate("/seller/dashboard")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <rect x="7" y="10" width="3" height="8" />
                  <rect x="12" y="6" width="3" height="12" />
                  <rect x="17" y="13" width="3" height="5" />
                </svg>
                Dashboard
              </button>
              <button className="ss-nav__link-btn" onClick={() => navigate("/seller/products")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                My Products
              </button>
              <button className="ss-nav__link-btn" onClick={() => navigate("/seller/orders")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Seller Orders
              </button>

            </>
          )}

          {/* Cart */}
          <button
            className="ss-nav__cart-btn"
            onClick={() => navigate("/cart")}
            aria-label="Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="ss-nav__cart-badge" key={cartCount}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* User avatar */}
          {user && (
            <div className="ss-nav__user">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="ss-nav__avatar"
                />
              ) : (
                <div className="ss-nav__avatar ss-nav__avatar--initial">
                  {userInitial}
                </div>
              )}
              <div className="ss-nav__user-info">
                <span className="ss-nav__user-greeting">Hello,</span>
                <span className="ss-nav__user-name">
                  {user.name?.split(" ")[0] ?? "User"}
                </span>
              </div>
            </div>
          )}

          {/* Sign out */}
          <button
            className="ss-nav__signout-btn"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Sign Out
          </button>

        </div>

        {/* Mobile hamburger */}
        <button
          className="ss-nav__hamburger"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="ss-nav__mobile-menu">
          <form className="ss-nav__mobile-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={handleSearchChange}
              className="ss-nav__search-input"
            />
          </form>
          <button className="ss-nav__mobile-link" onClick={() => { navigate("/my-orders"); setMobileMenuOpen(false); }}>My Orders</button>
          {currentUser?.role === "seller" && (
            <>
              <button
                className="ss-nav__mobile-link"
                onClick={() => {
                  navigate("/seller/dashboard");
                  setMobileMenuOpen(false);
                }}
              >
                Dashboard
              </button>

              <button
                className="ss-nav__mobile-link"
                onClick={() => {
                  navigate("/seller/products");
                  setMobileMenuOpen(false);
                }}
              >
                My Products
              </button>

              <button
                className="ss-nav__mobile-link"
                onClick={() => {
                  navigate("/seller/orders");
                  setMobileMenuOpen(false);
                }}
              >
                Seller Orders
              </button>
            </>
          )}
          <button className="ss-nav__mobile-link" onClick={() => { navigate("/cart"); setMobileMenuOpen(false); }}>
            Cart {cartCount > 0 && <span className="ss-nav__cart-badge">{cartCount}</span>}
          </button>
          <button className="ss-nav__mobile-link ss-nav__mobile-link--danger" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;