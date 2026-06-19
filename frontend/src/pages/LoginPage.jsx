import { useAuth0 } from "@auth0/auth0-react";

function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  const handleLogin    = () => loginWithRedirect({ authorizationParams: { screen_hint: "login"  } });
  const handleRegister = () => loginWithRedirect({ authorizationParams: { screen_hint: "signup" } });

  return (
    <div className="ss-login">

      {/* LEFT — Brand panel */}
      <div className="ss-login__left">
        <div className="ss-login__brand">
          <div className="ss-login__brand-logo">S</div>
          <h1 className="ss-login__brand-name">ShopSphere</h1>
          <p className="ss-login__brand-tagline">
            Millions of products. One seamless experience.<br />
            Shop smarter, live better.
          </p>

          <ul className="ss-login__features">
            {[
              { icon: "🚀", text: "Lightning-fast delivery across India" },
              { icon: "🔒", text: "Secure checkout powered by Stripe" },
              { icon: "↩️", text: "Hassle-free returns within 30 days" },
              { icon: "🎯", text: "Personalised deals just for you" },
            ].map((f) => (
              <li key={f.text} className="ss-login__feature">
                <span className="ss-login__feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT — Auth card */}
      <div className="ss-login__right">
        <div className="ss-login__card">

          <div className="ss-login__card-header">
            <div className="ss-login__card-logo">S</div>
            <h2 className="ss-login__card-title">Welcome to ShopSphere</h2>
            <p className="ss-login__card-sub">Create an account or sign in to continue.</p>
          </div>

          <div className="ss-login__card-actions">
            <button className="ss-btn ss-btn--primary ss-btn--full ss-btn--lg" onClick={handleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Sign In
            </button>

            <div className="ss-login__divider">
              <span>or</span>
            </div>

            <button className="ss-btn ss-btn--outline ss-btn--full ss-btn--lg" onClick={handleRegister}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Create Account
            </button>
          </div>

          <p className="ss-login__footnote">
            By continuing you agree to our{" "}
            <span className="ss-login__link">Terms of Service</span> and{" "}
            <span className="ss-login__link">Privacy Policy</span>.
          </p>

        </div>
      </div>

    </div>
  );
}

export default LoginPage;