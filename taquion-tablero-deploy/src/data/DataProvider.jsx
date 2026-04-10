import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Hardcoded fallback data (used while API loads or if API fails) ───
import { REVENUE_2026 as FALLBACK_REVENUE } from "./revenue.js";
import { OPPORTUNITIES as FALLBACK_OPPORTUNITIES, WON_2026 as FALLBACK_WON } from "./opportunities.js";
import { CUENTAS_ACTIVAS as FALLBACK_ACCOUNTS } from "./accounts.js";

const DataContext = createContext(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

// Fetch with timeout and error handling
async function fetchAPI(endpoint, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, { signal: controller.signal });
    if (!res.ok) throw new Error(`API ${endpoint} returned ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export default function DataProvider({ children }) {
  const [revenue, setRevenue] = useState(FALLBACK_REVENUE);
  const [opportunities, setOpportunities] = useState(FALLBACK_OPPORTUNITIES);
  const [won2026, setWon2026] = useState(FALLBACK_WON);
  const [accounts, setAccounts] = useState(FALLBACK_ACCOUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [source, setSource] = useState("local"); // "local" | "api"

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [revData, oppData, accData] = await Promise.all([
        fetchAPI("/api/revenue"),
        fetchAPI("/api/opportunities"),
        fetchAPI("/api/accounts"),
      ]);

      // Revenue: API returns { revenue: [...], updatedAt }
      if (revData?.revenue?.length > 0) {
        setRevenue(revData.revenue);
      }

      // Opportunities: API returns { opportunities: [...], won2026: [...], updatedAt }
      if (oppData?.opportunities?.length > 0) {
        setOpportunities(oppData.opportunities);
      }
      if (oppData?.won2026?.length > 0) {
        setWon2026(oppData.won2026);
      }

      // Accounts: API returns { accounts: [...], updatedAt }
      if (accData?.accounts?.length > 0) {
        setAccounts(accData.accounts);
      }

      setUpdatedAt(revData?.updatedAt || oppData?.updatedAt || new Date().toISOString());
      setSource("api");
    } catch (err) {
      console.warn("Failed to fetch live data, using fallback:", err.message);
      setError(err.message);
      setSource("local");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = {
    // Data
    revenue,
    opportunities,
    won2026,
    accounts,
    // Meta
    loading,
    error,
    updatedAt,
    source, // "api" or "local"
    refresh,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
