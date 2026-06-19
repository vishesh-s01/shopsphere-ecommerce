import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getProducts, deleteProduct } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import AddProductModal from "../components/AddProductModal";
import { useCurrentUser } from "../context/UserContext";
import EditProductModal from "../components/EditProductModal";

const CATEGORY_MAP = {
  // Electronics bucket
  "Mobiles": "Electronics", "Electronics": "Electronics",
  "Laptops": "Electronics", "Laptop": "Electronics",
  "Audio": "Electronics", "Wearables": "Electronics",
  "Gaming": "Electronics", "Camera": "Electronics",
  "Cameras": "Electronics", "Accessories": "Electronics",
  "Smart Home": "Electronics", "Tablets": "Electronics",
  // Fashion bucket
  "Fashion": "Fashion", "Shoes": "Fashion",
  "Clothing": "Fashion", "Watches": "Fashion",
  "Bags": "Fashion", "Jewellery": "Fashion",
  // Home bucket
  "Home": "Home & Kitchen", "Kitchen": "Home & Kitchen",
  "Furniture": "Home & Kitchen", "Decor": "Home & Kitchen",
  "Home & Kitchen": "Home & Kitchen",
  // Sports bucket
  "Sports": "Sports & Outdoors", "Fitness": "Sports & Outdoors",
  "Outdoors": "Sports & Outdoors", "Sports & Outdoors": "Sports & Outdoors",
  // Beauty bucket
  "Beauty": "Beauty & Health", "Health": "Beauty & Health",
  "Personal Care": "Beauty & Health", "Beauty & Health": "Beauty & Health",
  // Books bucket
  "Books": "Books & Stationery", "Stationery": "Books & Stationery",
  "Books & Stationery": "Books & Stationery",
  // Toys bucket
  "Toys": "Toys & Baby", "Baby": "Toys & Baby",
  "Kids": "Toys & Baby", "Toys & Baby": "Toys & Baby",
  // Grocery bucket
  "Grocery": "Grocery & Food", "Food": "Grocery & Food",
  "Grocery & Food": "Grocery & Food",
};

const DISPLAY_CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Sports & Outdoors",
  "Beauty & Health",
  "Books & Stationery",
  "Toys & Baby",
  "Grocery & Food",
];

const CATEGORY_ICONS = {
  "All":               "🛍️",
  "Electronics":       "📱",
  "Fashion":           "👗",
  "Home & Kitchen":    "🏠",
  "Sports & Outdoors": "⚽",
  "Beauty & Health":   "💄",
  "Books & Stationery":"📚",
  "Toys & Baby":       "🧸",
  "Grocery & Food":    "🛒",
};

const SORT_OPTIONS = [
  { value: "default",    label: "Featured" },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc",   label: "Name: A–Z" },
  { value: "name-desc",  label: "Name: Z–A" },
];

function useRevealOnce() {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setRevealed(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, revealed };
}

function AnimatedCard({ product, index, onAddToCart, onEdit, onDelete }) {
  const { ref, revealed } = useRevealOnce();
  return (
    <div
      ref={ref}
      style={{
        opacity:    revealed ? 1 : 0,
        transform:  revealed ? "translateY(0)" : "translateY(22px)",
        transition: revealed
          ? `opacity 0.38s ease ${index * 0.04}s, transform 0.38s ease ${index * 0.04}s`
          : "none",
      }}
    >
      <ProductCard
        product={product}
        onAddToCart={onAddToCart}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="ss-skeleton-card">
      <div className="skeleton ss-skeleton-card__img" />
      <div className="ss-skeleton-card__body">
        <div className="skeleton ss-skeleton-card__line ss-skeleton-card__line--sm" />
        <div className="skeleton ss-skeleton-card__line ss-skeleton-card__line--lg" />
        <div className="skeleton ss-skeleton-card__line ss-skeleton-card__line--md" />
        <div className="ss-skeleton-card__footer">
          <div className="skeleton ss-skeleton-card__price" />
          <div className="skeleton ss-skeleton-card__btn" />
        </div>
      </div>
    </div>
  );
}

function Toast({ message, visible, type = "success" }) {
  return createPortal(
    <div className={`ss-toast ss-toast--${type} ${visible ? "ss-toast--visible" : ""}`}>
      <span className="ss-toast__icon">{type === "success" ? "✓" : "!"}</span>
      {message}
    </div>,
    document.body
  );
}

/* Ecommerce hero illustration — colors pulled from CSS accent palette */
function HeroIllustration() {
  return (
    <svg
      className="ss-products__hero-illustration"
      viewBox="0 0 260 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background blobs */}
      <ellipse cx="200" cy="80" rx="70" ry="60" fill="rgba(255,255,255,0.07)" />
      <ellipse cx="60"  cy="110" rx="50" ry="40" fill="rgba(255,255,255,0.05)" />

      {/* Shopping bag */}
      <rect x="85" y="60" width="60" height="52" rx="6" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.55)" strokeWidth="2"/>
      <path d="M100 60 C100 52 120 52 120 60" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      {/* Bag handles */}
      <path d="M97 60 L97 55 Q115 44 133 55 L133 60" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

      {/* Stars / sparkles */}
      <circle cx="160" cy="38" r="3.5" fill="rgba(255,255,255,0.7)"/>
      <circle cx="72"  cy="42" r="2.5" fill="rgba(255,255,255,0.5)"/>
      <circle cx="195" cy="55" r="2"   fill="rgba(255,255,255,0.4)"/>
      <path d="M155 55 L157 50 L159 55 L164 57 L159 59 L157 64 L155 59 L150 57 Z" fill="rgba(255,255,255,0.55)"/>
      <path d="M68 72 L69.5 68 L71 72 L75 73.5 L71 75 L69.5 79 L68 75 L64 73.5 Z" fill="rgba(255,255,255,0.4)"/>

      {/* Small product cards floating */}
      <rect x="28"  y="56" width="36" height="42" rx="5" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"/>
      <rect x="32"  y="60" width="28" height="18" rx="3" fill="rgba(255,255,255,0.15)"/>
      <rect x="32"  y="82" width="18" height="3"  rx="1.5" fill="rgba(255,255,255,0.5)"/>
      <rect x="32"  y="88" width="12" height="3"  rx="1.5" fill="rgba(255,255,255,0.35)"/>

      <rect x="170" y="42" width="36" height="42" rx="5" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"/>
      <rect x="174" y="46" width="28" height="18" rx="3" fill="rgba(255,255,255,0.15)"/>
      <rect x="174" y="68" width="18" height="3"  rx="1.5" fill="rgba(255,255,255,0.5)"/>
      <rect x="174" y="74" width="12" height="3"  rx="1.5" fill="rgba(255,255,255,0.35)"/>

      {/* Cart icon inside bag */}
      <path d="M103 80 L105 74 L125 74 L123 83 L107 83 Z" fill="rgba(255,255,255,0.6)" />
      <circle cx="109" cy="86" r="2" fill="rgba(255,255,255,0.8)"/>
      <circle cx="120" cy="86" r="2" fill="rgba(255,255,255,0.8)"/>
      <path d="M100 77 L103 80" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Price tag */}
      <rect x="193" y="95" width="42" height="22" rx="11" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      <text x="203" y="110" fontFamily="system-ui,sans-serif" fontSize="9" fontWeight="700" fill="rgba(255,255,255,0.9)">SALE</text>

      {/* Discount badge */}
      <circle cx="38" cy="40" r="14" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      <text x="28" y="45" fontFamily="system-ui,sans-serif" fontSize="9" fontWeight="800" fill="white">50%</text>
    </svg>
  );
}

function ProductsPage({ darkMode, toggleDarkMode }) {
  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [searchQuery, setSearchQuery]       = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy]                 = useState("default");
  const [showAddModal, setShowAddModal]     = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toastMsg, setToastMsg]             = useState("");
  const [toastType, setToastType]           = useState("success");
  const [toastVisible, setToastVisible]     = useState(false);
  const { currentUser } = useCurrentUser();

  const showToast = useCallback((msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  }, []);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = useCallback(async (product) => {
    await addToCart(product._id ?? product.id, 1);
  }, []);

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(productId);
      await fetchProducts();
      showToast("Product deleted successfully!", "success");
    } catch {
      showToast("Failed to delete product.", "error");
    }
  };

  const availableCategories = useMemo(() => {
    const presentBuckets = new Set(products.map((p) => CATEGORY_MAP[p.category] ?? p.category));
    return DISPLAY_CATEGORIES.filter((cat) => cat === "All" || presentBuckets.has(cat));
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== "All") {
      list = list.filter((p) => (CATEGORY_MAP[p.category] ?? p.category) === activeCategory);
    }
    switch (sortBy) {
      case "price-asc":  list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "name-asc":   list.sort((a, b) => (a.title || a.name || "").localeCompare(b.title || b.name || "")); break;
      case "name-desc":  list.sort((a, b) => (b.title || b.name || "").localeCompare(a.title || a.name || "")); break;
      default: break;
    }
    return list;
  }, [products, searchQuery, activeCategory, sortBy]);

  if (loading) {
    return (
      <>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div className="ss-products-page">
          <div className="skeleton ss-products__skeleton-hero" />
          <div className="ss-products__skeleton-toolbar">
            {[1,2,3,4].map(i => <div key={i} className="skeleton ss-products__skeleton-pill" />)}
            <div className="skeleton ss-products__skeleton-sort" />
          </div>
          <div className="ss-products__grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toast message={toastMsg} visible={toastVisible} type={toastType} />
      <Navbar onSearch={setSearchQuery} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="ss-products-page">

        {/* Hero Banner — illustration replaces the Add Product button */}
        <div className="ss-products__hero">
          <div className="ss-products__hero-content">
            <p className="ss-products__hero-eyebrow">Welcome to ShopSphere</p>
            <h1 className="ss-products__hero-title">Discover Amazing Products</h1>
            <p className="ss-products__hero-sub">
              {products.length.toLocaleString()} curated items across{" "}
              {availableCategories.length - 1} categories
            </p>
          </div>
          <HeroIllustration />
        </div>

        {/* Filter + Sort toolbar */}
        <div className="ss-products__toolbar">
          <div className="ss-products__pills">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                className={`ss-products__pill${activeCategory === cat ? " ss-products__pill--active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span className="ss-products__pill-icon">{CATEGORY_ICONS[cat]}</span>
                {cat}
              </button>
            ))}
          </div>

          <select
            className="ss-products__sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="ss-products__count">
          {searchQuery || activeCategory !== "All" ? (
            <>
              <strong>{filtered.length}</strong> result{filtered.length !== 1 ? "s" : ""}
              {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
              {activeCategory !== "All" && <> in <strong>{activeCategory}</strong></>}
            </>
          ) : (
            <><strong>{filtered.length}</strong> products available</>
          )}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="ss-products__grid">
            {filtered.map((product, i) => (
              <AnimatedCard
                key={product._id}
                product={product}
                index={i}
                onAddToCart={handleAddToCart}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        ) : (
          <div className="ss-products__empty">
            <div className="ss-products__empty-icon">🔍</div>
            <h3 className="ss-products__empty-title">No products found</h3>
            <p className="ss-products__empty-sub">Try a different search term or category</p>
            <button
              className="ss-btn ss-btn--primary"
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>

      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={fetchProducts}
      />
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedProduct(null); }}
        product={selectedProduct}
        onProductUpdated={fetchProducts}
      />
    </>
  );
}

export default ProductsPage;