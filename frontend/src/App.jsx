
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import MerchantLogin from "./components/MerchantLogin";
import MerchantDashboard from "./components/MerchantDashboard";

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        console.error("Session restoration failed:", error.message);
        setSession(null);
        return;
      }

      setSession(data.session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return (
      <div style={styles.loading}>
        Loading ResolveAI...
      </div>
    );
  }

  if (!session) {
    return <MerchantLogin />;
  }

  return (
    <MerchantDashboard
      user={session.user}
      onLogout={() => supabase.auth.signOut()}
    />
  );
}

const styles = {
  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    fontFamily: "Arial, sans-serif",
    color: "#475569",
  },
};
