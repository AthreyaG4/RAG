import { createContext, useEffect, useState } from "react";
import * as api from "../api/health";

export const HealthContext = createContext(null);

export function HealthProvider({ children }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      const response = await api.getHealth();
      setHealth(response);
      return response;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    if (!health || health.status == "healthy") return;

    const timeout = setTimeout(fetchHealth, 2000);
    return () => clearTimeout(timeout);
  }, [health]);

  return (
    <HealthContext.Provider
      value={{
        health,
        refetchHealth: fetchHealth,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}
