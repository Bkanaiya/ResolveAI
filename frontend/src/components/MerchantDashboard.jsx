
import { useEffect, useState } from "react";
import { ShieldCheck, LogOut, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import DisputeForm from "./DisputeForm";
import SubmissionSuccess from "./SubmissionSuccess";

export default function MerchantDashboard({ user, onLogout }) {
  const [merchant, setMerchant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cases, setCases] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    const [merchantResult, ordersResult, casesResult] =
      await Promise.all([
        supabase
          .from("merchants")
          .select("id, name")
          .single(),

        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),

        supabase
          .from("cases")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

    const firstError =
      merchantResult.error ||
      ordersResult.error ||
      casesResult.error;

    if (firstError) {
      setError(firstError.message);
    } else {
      setMerchant(merchantResult.data);
      setOrders(ordersResult.data || []);
      setCases(casesResult.data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, [user.id]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
    }
  }

  if (loading) {
    return <div style={styles.loading}>Loading merchant dashboard...</div>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <ShieldCheck size={25} color="#2563eb" />
          <strong>ResolveAI</strong>
        </div>

        <button onClick={handleLogout} style={styles.logout}>
          <LogOut size={16} />
          Sign out
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.heading}>
          <div>
            <p style={styles.eyebrow}>MERCHANT PORTAL</p>
            <h1>Dashboard</h1>
            <p style={styles.muted}>
              {merchant?.name || "Merchant"}
            </p>
          </div>

          <button onClick={loadDashboard} style={styles.refresh}>
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <section style={styles.stats}>
          <StatCard label="Total orders" value={orders.length} />
          <StatCard label="Total cases" value={cases.length} />
          <StatCard
            label="Resolved cases"
            value={cases.filter((c) => c.status === "resolved").length}
          />
          <StatCard
            label="Escalated cases"
            value={cases.filter((c) => c.status === "escalated").length}
          />
        </section>

        <section style={styles.section}>
          <h2>Submit a payment issue</h2>

          {result ? (
            <SubmissionSuccess
              result={result}
              onReset={() => setResult(null)}
            />
          ) : (
            <DisputeForm onSuccess={setResult} />
          )}
        </section>

        <section style={styles.section}>
          <h2>Recent cases</h2>

          {cases.length === 0 ? (
            <p style={styles.muted}>No cases found.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Case number</th>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {cases.map((item) => (
                    <tr key={item.id}>
                      <td>{item.case_number || item.id}</td>
                      <td>{item.issue_type || "—"}</td>
                      <td>
                        <span style={styles.status}>
                          {item.status || "—"}
                        </span>
                      </td>
                      <td>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={styles.section}>
          <h2>Recent orders</h2>

          {orders.length === 0 ? (
            <p style={styles.muted}>No orders found.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Payment status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.order_id}</td>
                      <td>{order.amount}</td>
                      <td>{order.currency}</td>
                      <td>{order.payment_status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer style={styles.footer}>
          ResolveAI · Evidence-first payment dispute resolution
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.muted}>{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily: "Arial, sans-serif",
    color: "#172033",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 5%",
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 21,
  },
  logout: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#ffffff",
    cursor: "pointer",
  },
  main: {
    maxWidth: 1150,
    margin: "0 auto",
    padding: "35px 20px",
  },
  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  eyebrow: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
  },
  muted: {
    color: "#64748b",
    fontSize: 14,
  },
  refresh: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#ffffff",
    cursor: "pointer",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 20,
  },
  section: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 22,
    marginBottom: 22,
    overflow: "hidden",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: 14,
  },
  status: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 6,
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 12,
  },
  error: {
    padding: 12,
    background: "#fef2f2",
    color: "#b91c1c",
    borderRadius: 8,
  },
  footer: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
    padding: 20,
  },
  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    fontFamily: "Arial, sans-serif",
  },
};
