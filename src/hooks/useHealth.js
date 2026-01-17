import { useEffect, useState } from "react";
import * as api from "../api/health";

export function useHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const response = await api.getHealth();
      setHealth(response);
      return response;
    } catch (err) {
      console.error(err);
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

  return { health, loading, refetchHealth: fetchHealth };
}
