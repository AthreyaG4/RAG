import { useEffect, useState } from "react";
import * as api from "../api/progress";

export function useProgress(token, project_id) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      const response = await api.getProgress(token, project_id);
      setProgress(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !project_id) return;
    fetchProgress();
  }, [token, project_id]);

  useEffect(() => {
    if (!progress || progress.status !== "processing") return;

    const timeout = setTimeout(fetchProgress, 2000);
    return () => clearTimeout(timeout);
  }, [progress]);

  return { progress, loading, refetchProgress: fetchProgress };
}
