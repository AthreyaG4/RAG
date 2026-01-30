import { createContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProjects } from "../hooks/useProjects";
import * as api from "../api/progress";

export const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token, logout } = useAuth();
  const { selectedProjectId } = useProjects();

  const fetchProgress = async () => {
    try {
      const response = await api.getProgress(token, selectedProjectId);
      setProgress(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !selectedProjectId) return;
    fetchProgress();
  }, [token, selectedProjectId]);

  useEffect(() => {
    if (!progress || progress.status !== "processing") return;

    const timeout = setTimeout(fetchProgress, 2000);
    return () => clearTimeout(timeout);
  }, [progress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        refetchProgress: fetchProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}
