
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function MerchantLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError(loginError.message);
    }

    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleLogin} style={styles.card}>
        <div style={styles.logo}>
          <ShieldCheck size={30} />
        </div>

        <h1>ResolveAI</h1>
        <p style={styles.subtitle}>Merchant Portal</p>

        <label style={styles.label}>Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="merchant@example.com"
          required
          style={styles.input}
          autoComplete="username"
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          style={styles.input}
          autoComplete="current-password"
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p style={styles.footer}>
          Secure merchant access
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f4f7fb",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 32,
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 8px 35px rgba(15, 23, 42, 0.08)",
    boxSizing: "border-box",
  },
  logo: {
    color: "#2563eb",
    marginBottom: 12,
  },
  subtitle: {
    color: "#64748b",
    marginBottom: 28,
  },
  label: {
    display: "block",
    marginBottom: 8,
    marginTop: 18,
    fontSize: 14,
    fontWeight: 600,
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: 12,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    boxSizing: "border-box",
    fontSize: 15,
  },
  button: {
    width: "100%",
    padding: 13,
    marginTop: 24,
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 14,
  },
  footer: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 24,
  },
};
