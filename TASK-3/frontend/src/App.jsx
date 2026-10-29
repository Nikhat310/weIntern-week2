
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/auth";

const initialForm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function getStrength(password) {
  if (!password) return { label: "WAITING FOR INPUT", score: 0 };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = [
    "VERY WEAK",
    "WEAK",
    "FAIR",
    "GOOD",
    "STRONG",
    "EXCELLENT",
  ];

  return { label: labels[score], score };
}

function App() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("auth");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [activity, setActivity] = useState([
    "AUTH MODULE INITIALIZED",
    "JWT VERIFICATION ENABLED",
    "AWAITING USER AUTHENTICATION",
  ]);

  const registering = mode === "register";
  const strength = getStrength(form.password);

  function addActivity(text) {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setActivity((previous) =>
      [`[${time}] ${text}`, ...previous].slice(0, 6)
    );
  }

  function notify(text, type = "error") {
    setMessage(text);
    setMessageType(type);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
  }

  function clearForm() {
    setForm(initialForm);
    setShowPassword(false);
    setShowConfirm(false);
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    clearForm();
    setMessage("");
  }

  function clearSession() {
    sessionStorage.removeItem("authToken");
    setUser(null);
    setPage("auth");
  }

  async function checkProfile(token) {
    try {
      const response = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        sessionStorage.removeItem("authToken");
        return false;
      }

      setUser(data.user);
      setPage("console");
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = sessionStorage.getItem("authToken");

      if (token) {
        try {
          const response = await fetch(`${API}/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json().catch(() => ({}));

          if (!active) return;

          if (response.ok) {
            setUser(data.user);
            setPage("console");
          } else {
            sessionStorage.removeItem("authToken");
          }
        } catch {
          if (active) {
            notify("Backend connection unavailable. Check your server.");
          }
        }
      }

      if (active) setChecking(false);
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (registering) {
      if (username.length < 3) {
        notify("Username must contain at least 3 characters.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        notify("Enter a valid email address.");
        return;
      }

      if (password.length < 8) {
        notify("Use a password with at least 8 characters.");
        return;
      }

      if (form.confirmPassword !== password) {
        notify("The passwords do not match.");
        return;
      }
    } else if (!email || !password) {
      notify("Email and password are required.");
      return;
    }

    setLoading(true);
    addActivity(registering ? "REGISTRATION REQUEST CREATED" : "LOGIN REQUEST CREATED");

    try {
      const endpoint = registering ? "/register" : "/login";
      const payload = registering
        ? { username, email, password }
        : { email, password };

      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        addActivity("AUTHENTICATION REQUEST REJECTED");
        notify(data.message || "Authentication failed.");
        return;
      }

      if (!data.token) {
        notify("No token was returned by the server.");
        return;
      }

      sessionStorage.setItem("authToken", data.token);
      const success = await checkProfile(data.token);

      if (success) {
        addActivity("JWT RECEIVED — PROFILE VERIFIED");
        addActivity("PROTECTED CONSOLE ACCESS GRANTED");
        clearForm();
        notify(
          registering ? "IDENTITY CREATED SUCCESSFULLY" : "ACCESS GRANTED — WELCOME BACK",
          "success"
        );
      } else {
        notify("Login succeeded, but the protected profile could not be loaded.");
      }
    } catch {
      notify("Cannot reach the backend. Make sure your server is running.");
      addActivity("SERVER CONNECTION FAILED");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("authToken");
    setUser(null);
    setPage("auth");
    setMode("login");
    clearForm();
    notify("SESSION CLEARED SUCCESSFULLY", "success");
    addActivity("USER LOGGED OUT — LOCAL TOKEN CLEARED");
  }

  if (checking) {
    return (
      <main className="boot-screen">
        <div className="boot-mark">A<span>.</span></div>
        <p>INITIALIZING AUTHSECURE...</p>
        <div className="boot-line"><span /></div>
      </main>
    );
  }

  if (page === "console" && user) {
    return (
      <main className="console-page">
        <header className="console-topbar">
          <a className="wordmark" href="#console">
            AUTH<span>SECURE</span><i>.</i>
          </a>
          <div className="topbar-center">
            <span className="live-dot" /> IDENTITY SYSTEM ONLINE
          </div>
          <button className="outline-button" onClick={logout}>
            TERMINATE SESSION ↗
          </button>
        </header>

        <div className="console-content" id="console">
          <div className="console-intro">
            <div>
              <p className="micro-label">SECURE ENVIRONMENT / 001</p>
              <h1>Identity<span> console.</span></h1>
              <p className="console-subtitle">
                Authenticated session detected. Your protected workspace is ready.
              </p>
            </div>
            <div className="system-stamp">
              <span>ACCESS</span>
              <strong>GRANTED</strong>
              <small>JWT VERIFIED ✓</small>
            </div>
          </div>

          <section className="identity-strip">
            <div className="identity-symbol">
              {(user.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="identity-main">
              <p className="micro-label">SIGNED IN AS</p>
              <h2>{user.username}</h2>
              <p>{user.email}</p>
            </div>
            <div className="identity-state">
              <span className="live-dot" />
              ACTIVE IDENTITY
            </div>
          </section>

          <div className="console-grid">
            <section className="console-panel">
              <div className="panel-topline">
                <span>01 / IDENTITY RECORD</span>
                <span>READ ONLY</span>
              </div>
              <h2>Account details</h2>
              <p className="panel-description">
                Data returned by the protected profile endpoint.
              </p>

              <div className="terminal-details">
                <div><span>username</span><strong>{user.username}</strong></div>
                <div><span>email</span><strong>{user.email}</strong></div>
                <div><span>user_id</span><strong>{user._id || "Not returned"}</strong></div>
                <div><span>route</span><strong>GET /api/auth/me</strong></div>
                <div><span>access</span><strong className="lime-text">AUTHORIZED</strong></div>
              </div>
            </section>

            <section className="console-panel">
              <div className="panel-topline">
                <span>02 / SECURITY PROTOCOLS</span>
                <span>STATUS</span>
              </div>
              <h2>Security checks</h2>
              <p className="panel-description">
                Implemented authentication controls.
              </p>

              <div className="protocol-row">
                <div className="protocol-icon">01</div>
                <div><strong>Password hashing</strong><p>bcrypt password protection</p></div>
                <span className="protocol-status">ACTIVE</span>
              </div>
              <div className="protocol-row">
                <div className="protocol-icon">02</div>
                <div><strong>Token validation</strong><p>JWT signature verification</p></div>
                <span className="protocol-status">ACTIVE</span>
              </div>
              <div className="protocol-row">
                <div className="protocol-icon">03</div>
                <div><strong>Protected route</strong><p>Bearer token required</p></div>
                <span className="protocol-status">ACTIVE</span>
              </div>
              <div className="protocol-row">
                <div className="protocol-icon">04</div>
                <div><strong>Input validation</strong><p>Required fields checked</p></div>
                <span className="protocol-status">ACTIVE</span>
              </div>
            </section>

            <section className="console-panel activity-panel">
              <div className="panel-topline">
                <span>03 / EVENT STREAM</span>
                <span>LOCAL ACTIVITY</span>
              </div>
              <h2>System activity</h2>
              <p className="panel-description">
                Recent interface events from this session.
              </p>
              <div className="event-terminal">
                <div className="terminal-heading">
                  <span /><span /><span />
                  <small>authsecure://events</small>
                </div>
                {activity.map((item, index) => (
                  <p key={`${item}-${index}`}>
                    <span className="terminal-chevron">&gt;</span> {item}
                  </p>
                ))}
                <div className="terminal-cursor">_</div>
              </div>
            </section>

            <section className="console-panel signout-panel">
              <div className="signout-mark">↗</div>
              <p className="micro-label">END YOUR SESSION</p>
              <h2>Leaving already?</h2>
              <p className="panel-description">
                Clear the locally stored token and return to the authentication screen.
              </p>
              <button className="lime-button" onClick={logout}>
                LOG OUT SECURELY <span>↗</span>
              </button>
            </section>
          </div>

          <footer className="console-footer">
            <span>AUTHSECURE / MERN AUTHENTICATION PROJECT</span>
            <span>REACT · EXPRESS · MONGODB · JWT</span>
          </footer>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-left">
        <header className="auth-nav">
          <a className="wordmark" href="#home">
            AUTH<span>SECURE</span><i>.</i>
          </a>
          <span className="nav-index">IDENTITY PLATFORM / V1.0</span>
        </header>

        <div className="hero-copy" id="home">
          <p className="micro-label"><span className="live-dot" /> DIGITAL IDENTITY PROTOCOL</p>
          <h1>
            Access is a
            <br />
            <span>privilege.</span>
            <br />
            Protect it.
          </h1>
          <p className="hero-description">
            A focused authentication experience designed around secure identity,
            verified access, and protected digital spaces.
          </p>

          <div className="hero-rule" />

          <div className="feature-list">
            <div><span>01</span><p><strong>Encrypted credentials</strong><small>Passwords hashed before storage</small></p></div>
            <div><span>02</span><p><strong>Token-based access</strong><small>JWT-backed protected endpoints</small></p></div>
            <div><span>03</span><p><strong>Controlled sessions</strong><small>Authenticated access to your profile</small></p></div>
          </div>
        </div>

        <div className="left-footer">
          <span>BUILT FOR A MORE SECURE WEB.</span>
          <span>IND / 2026</span>
        </div>

        <div className="grid-decoration" aria-hidden="true" />
      </section>

      <section className="auth-right">
        <div className="auth-box">
          <div className="form-top">
            <div className="form-symbol">A<span>.</span></div>
            <span className="form-tag">SECURE GATEWAY</span>
          </div>

          <p className="micro-label">{registering ? "NEW IDENTITY" : "IDENTITY VERIFICATION"} / 0{registering ? "2" : "1"}</p>
          <h2>{registering ? "Create your identity." : "Welcome back."}</h2>
          <p className="form-intro">
            {registering
              ? "Set up your account to enter the secure environment."
              : "Enter your credentials to continue to your private workspace."}
          </p>

          <div className="mode-switch">
            <button
              type="button"
              className={!registering ? "mode-active" : ""}
              onClick={() => changeMode("login")}
            >
              SIGN IN
            </button>
            <button
              type="button"
              className={registering ? "mode-active" : ""}
              onClick={() => changeMode("register")}
            >
              REGISTER
            </button>
          </div>

          {message && (
            <div className={`notice ${messageType}`} role="status" aria-live="polite">
              <span>{messageType === "success" ? "✓" : "!"}</span>
              {message}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {registering && (
              <div className="field">
                <label htmlFor="username">USERNAME <span>REQUIRED</span></label>
                <input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={updateField}
                  placeholder="Choose a username"
                  autoComplete="username"
                  minLength={3}
                  required
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">EMAIL ADDRESS <span>REQUIRED</span></label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">PASSWORD <span>REQUIRED</span></label>
              <div className="input-with-action">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={updateField}
                  placeholder={registering ? "Create a strong password" : "Enter your password"}
                  autoComplete={registering ? "new-password" : "current-password"}
                  minLength={registering ? 8 : undefined}
                  required
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              {registering && (
                <div className="password-strength">
                  <div className="strength-track">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={n <= strength.score ? `strength-on strength-level-${strength.score}` : ""} />
                    ))}
                  </div>
                  <div className="strength-caption">
                    <span>PASSWORD STRENGTH</span>
                    <strong>{strength.label}</strong>
                  </div>
                </div>
              )}
            </div>

            {registering && (
              <div className="field">
                <label htmlFor="confirmPassword">CONFIRM PASSWORD <span>REQUIRED</span></label>
                <div className="input-with-action">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm((value) => !value)}>
                    {showConfirm ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>
            )}

            <button className="access-button" type="submit" disabled={loading}>
              <span>{loading ? "VERIFYING CREDENTIALS..." : registering ? "CREATE IDENTITY" : "VERIFY & CONTINUE"}</span>
              <span>{loading ? "..." : "↗"}</span>
            </button>
          </form>

          <div className="form-bottom">
            <span className="mini-lock">◇</span>
            <span>Credentials are handled by your authentication server.</span>
          </div>

          <div className="gateway-status">
            <span><i /> AUTH GATEWAY</span>
            <span>JWT / BCRYPT</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
