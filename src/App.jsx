import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  Link,
} from "react-router-dom";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/* ========= Product data ========= */

const PRODUCTS = [
  {
    id: "iphone-17-pro",
    name: "Aictronics Phone Pro",
    heroTitle: "Aictronics Phone Pro",
    tagline: "All out Pro.",
    descriptionShort:
      "Stunning triple-camera system. OLED display. Built for creators and power users.",
    descriptionLong:
      "Aictronics Phone Pro features a pro-grade triple-camera system, a 120Hz OLED display, and all-day battery life. Designed for creators, gamers, and anyone who wants the very best.",
    price: 1199,
    image: "/images/image.png",
    theme: "dark",
    eyebrow: "New",
  },
  {
    id: "iphone-air",
    name: "Aictronics Phone Air",
    heroTitle: "Aictronics Phone Air",
    tagline: "Thin. Light. Powerful.",
    descriptionShort:
      "The thinnest Aictronics phone ever, with all-day battery life.",
    descriptionLong:
      "Phone Air packs serious performance into an incredibly thin and light design. Perfect for people who want power that practically disappears in your hand.",
    price: 999,
    image: "/images/iphone-air.jpeg",
    theme: "light",
    eyebrow: "New",
  },
  {
    id: "macbook-pro-m5",
    name: "Aictronics ProBook M5",
    heroTitle: "Aictronics ProBook M5",
    tagline: "Supercharged by M5.",
    descriptionShort:
      "Next-gen performance and battery life in a sleek aluminum body.",
    descriptionLong:
      "ProBook M5 brings workstation-class performance to a slim notebook. Edit 8K video, build games, and run heavy workflows with ease.",
    price: 1999,
    image: "/images/macbookprom5.jpeg",
    theme: "dark",
    eyebrow: "Powerhouse",
  },
  {
    id: "airpods-pro-3",
    name: "Aictronics Buds Pro 3",
    heroTitle: "Aictronics Buds Pro 3",
    tagline: "Hear the future.",
    descriptionShort:
      "Immersive sound with Active Noise Cancellation and AI voice clarity.",
    descriptionLong:
      "Buds Pro 3 deliver rich, immersive audio with powerful ANC, transparency mode, and AI-powered voice isolation so you sound clear on every call.",
    price: 299,
    image: "/images/airpodspro-3.jpeg",
    theme: "light",
    eyebrow: "Now available",
  },
];

const FEATURED_SECTIONS = PRODUCTS.map((p) => ({
  id: p.id,
  title: p.heroTitle,
  tagline: p.tagline,
  description: p.descriptionShort,
  theme: p.theme,
  eyebrow: p.eyebrow,
  primaryCta: "Learn more",
  secondaryCta: "Buy",
  image: p.image,
}));

/* ========= Cart context (with localStorage) ========= */

const CartContext = createContext(null);

function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("aictronics-cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("aictronics-cart", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (productId, quantity = 1) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          productId,
          name: product.name,
          price: product.price,
          quantity,
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.max(1, quantity) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const value = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function useCart() {
  return useContext(CartContext);
}

/* ========= Fullscreen hero component ========= */

function ProductHero({ section, index }) {
  const isDark = section.theme === "dark";
  const ref = useRef(null);
  const [visible, setVisible] = useState(index === 0);
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={section.id}
      className={`hero-full ${
        isDark ? "hero-dark" : "hero-light"
      } ${visible ? "hero-visible" : ""}`}
      style={{ backgroundImage: `url(${section.image})` }}
    >
      <div className="hero-overlay">
        {section.eyebrow && (
          <p className="hero-eyebrow">{section.eyebrow}</p>
        )}
        <h1 className="hero-heading">{section.title}</h1>
        <p className="hero-tagline">{section.tagline}</p>
        <p className="hero-description">{section.description}</p>
        <div className="hero-cta-row">
          <button
            className="hero-cta hero-cta-filled"
            onClick={() => navigate(`/product/${section.id}`)}
          >
            {section.primaryCta}
          </button>
          <button
            className="hero-cta hero-cta-outline"
            onClick={() => navigate(`/product/${section.id}#buy`)}
          >
            {section.secondaryCta}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ========= Apple TV–style carousel ========= */

function ProductCarousel() {
  const navigate = useNavigate();
  const slides = PRODUCTS;
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const [slideWidth, setSlideWidth] = useState(0);

  // measure slide width once
  useEffect(() => {
    if (!trackRef.current) return;
    const firstSlide = trackRef.current.querySelector(".tv-slide");
    if (!firstSlide) return;

    const rect = firstSlide.getBoundingClientRect();
    const style = window.getComputedStyle(firstSlide);
    const marginRight = parseFloat(style.marginRight) || 0;
    setSlideWidth(rect.width + marginRight);
  }, []);

  // auto-rotate (change 8000 to whatever you like)
  useEffect(() => {
    if (!slideWidth) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slideWidth, slides.length]);

  const offset = slideWidth ? -index * slideWidth : 0;

  return (
    <section className="carousel-section">
      <div className="content-container carousel-inner">
        <div className="carousel-header">
          <h2>See more of our products</h2>
          <p className="muted light">
            Swipe or wait — the strip will slide through the Aictronics lineup.
            Tap any card to open its product page.
          </p>
        </div>

        <div className="tv-carousel-shell">
          <div
            className="tv-carousel-track"
            ref={trackRef}
            style={{ transform: `translateX(${offset}px)` }}
          >
            {slides.map((product, i) => (
              <div
                key={product.id}
                className={`tv-slide ${i === index ? "active" : ""}`}
              >
                <div
                  className="tv-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="tv-image-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="tv-image"
                    />
                  </div>
                  <div className="tv-text">
                    <p className="tv-eyebrow">{product.tagline}</p>
                    <h3 className="tv-title">{product.name}</h3>
                    <p className="tv-description">
                      {product.descriptionShort}
                    </p>
                    <p className="tv-price">
                      From{" "}
                      <span>
                        $
                        {product.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-dots">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={`carousel-dot ${i === index ? "active" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========= Smaller horizontal product row ========= */

function ProductRowStrip() {
  const navigate = useNavigate();

  return (
    <section className="row-strip-section">
      <div className="content-container row-strip-inner">
        <div className="row-strip-header">
          <h2>Explore more</h2>
          <p className="muted light">
            A quick look at the rest of the Aictronics family. Scroll sideways
            and tap any product to learn more.
          </p>
        </div>

        <div className="row-strip-track">
          {PRODUCTS.map((product) => (
            <button
              key={product.id}
              className="row-card"
              type="button"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="row-card-image-wrap">
                <img
                  src={product.image}
                  alt={product.name}
                  className="row-card-image"
                />
              </div>
              <div className="row-card-text">
                <p className="row-card-name">{product.name}</p>
                <p className="row-card-price">
                  $
                  {product.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========= Pages ========= */

function HomePage() {
  return (
    <>
      {FEATURED_SECTIONS.map((section, index) => (
        <ProductHero key={section.id} section={section} index={index} />
      ))}

      <ProductCarousel />
      <ProductRowStrip />
    </>
  );
}

function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = PRODUCTS.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) navigate("/");
  }, [product, navigate]);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product.id, quantity);
    navigate("/cart");
  };

  return (
    <section className="page-section">
      <div className="content-container product-layout" id="buy">
        <div className="product-media">
          <img
            src={product.image}
            alt={product.name}
            className="product-image-large"
          />
        </div>
        <div className="product-info">
          <p className="product-eyebrow">Aictronics</p>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-tagline">{product.tagline}</p>
          <p className="product-description">{product.descriptionLong}</p>
          <p className="product-price">
            $
            {product.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>

          <div className="product-quantity-row">
            <label>
              Quantity
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </label>
          </div>

          <div className="product-actions">
            <button className="btn-primary" onClick={handleAdd}>
              Add to Cart
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/cart")}
            >
              Go to Cart
            </button>
          </div>

          <p className="product-note">
            Free delivery · 14-day returns · 1-year limited warranty.
          </p>
        </div>
      </div>
    </section>
  );
}

function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } =
    useCart();
  const navigate = useNavigate();

  return (
    <section className="page-section">
      <div className="content-container">
        <h1 className="section-title">Your Cart</h1>

        {items.length === 0 ? (
          <p className="muted">
            Your cart is empty.{" "}
            <Link to="/" className="link">
              Continue shopping
            </Link>
            .
          </p>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.productId} className="cart-item">
                  <div>
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">
                      $
                      {item.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-controls small">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.productId,
                            Math.max(1, Number(e.target.value) || 1)
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="link"
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="link small-link"
                type="button"
                onClick={clearCart}
              >
                Clear cart
              </button>
            </div>

            <aside className="cart-summary">
              <h2>Summary</h2>
              <p className="cart-summary-line">
                Subtotal{" "}
                <span>
                  $
                  {subtotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </p>
              <p className="cart-summary-note">
                Taxes and shipping will be calculated at checkout.
              </p>
              <button
                className="btn-primary full-width"
                type="button"
                onClick={() => navigate("/checkout")}
              >
                Checkout
              </button>
              <button
                className="btn-secondary full-width"
                type="button"
                onClick={() => navigate("/")}
              >
                Continue shopping
              </button>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleGuestCheckout = () => {
    clearCart();
    alert("Thank you for your purchase! (Demo checkout)");
    navigate("/");
  };

  return (
    <section className="page-section">
      <div className="content-container">
        <h1 className="section-title">Checkout</h1>

        {items.length === 0 ? (
          <p className="muted">
            Your cart is empty.{" "}
            <Link to="/" className="link">
              Start shopping
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="checkout-layout">
              <div className="checkout-column">
                <h2>Checkout as guest</h2>
                <p className="muted">
                  No account needed. We’ll ask for your shipping and payment
                  details on the next step.
                </p>
                <button
                  className="btn-primary full-width"
                  type="button"
                  onClick={handleGuestCheckout}
                >
                  Continue as guest
                </button>
              </div>

              <div className="checkout-column">
                <h2>Sign in</h2>
                <p className="muted">
                  In a real store, this would let users see saved addresses and
                  orders.
                </p>
                <form
                  className="login-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert(
                      "Login is a visual demo only. You can connect real auth later."
                    );
                  }}
                >
                  <input type="email" placeholder="Email" required />
                  <input type="password" placeholder="Password" required />
                  <button className="btn-secondary full-width" type="submit">
                    Sign in
                  </button>
                </form>
              </div>
            </div>

            <div className="order-summary">
              <h2>Order summary</h2>
              <ul>
                {items.map((item) => (
                  <li key={item.productId}>
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>
                      $
                      {(item.price * item.quantity).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 }
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="cart-summary-line total">
                Total{" "}
                <span>
                  $
                  {subtotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ========= Header & Footer ========= */

function Header() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <button
          className="nav-logo-button"
          onClick={() => navigate("/")}
        >
          AICTRONICS
        </button>

        <nav className="nav-links">
          <a
            href="#iphone-17-pro"
            onClick={(e) => {
              e.preventDefault();
              navigate("/#iphone-17-pro");
            }}
          >
            Phone Pro
          </a>
          <a
            href="#iphone-air"
            onClick={(e) => {
              e.preventDefault();
              navigate("/#iphone-air");
            }}
          >
            Phone Air
          </a>
          <a
            href="#macbook-pro-m5"
            onClick={(e) => {
              e.preventDefault();
              navigate("/#macbook-pro-m5");
            }}
          >
            Laptop
          </a>
          <a
            href="#airpods-pro-3"
            onClick={(e) => {
              e.preventDefault();
              navigate("/#airpods-pro-3");
            }}
          >
            Buds
          </a>
        </nav>

        <div className="nav-icons">
          <button
            className="nav-icon-button"
            type="button"
            onClick={() => navigate("/cart")}
          >
            🛒
            {totalItems > 0 && (
              <span className="cart-count-badge">{totalItems}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>© {year} Aictronics Inc. All rights reserved.</p>
        <p className="footer-sub">
          Demo store inspired by Apple’s product storytelling. No real orders
          are processed.
        </p>
      </div>
    </footer>
  );
}

/* ========= App root ========= */

function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <CartProvider>
      <div className="page">
        <Header />
        <main className={isHome ? "main-snap" : "main-normal"}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;