import { useEffect, useState } from "react";
import * as api from "../api/documents";

export function useDocuments(token, project_id) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    try {
      // console.log(`Fetching Documents for project: ${project_id}.....`);
      const response = await api.getDocuments(token, project_id);
      setDocuments(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !project_id) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    fetchDocuments();
  }, [token, project_id]);

  async function createDocuments(files) {
    // console.log(`Creating Documents for project: ${project_id}.....`);
    const createdDocuments = await api.createDocuments(
      token,
      files,
      project_id,
    );
    setDocuments((prev) => prev.concat(createdDocuments));
    return createdDocuments;
  }

  async function deleteDocument(id) {
    // console.log(`Deleting Document: ${id} for project: ${project_id}.....`);
    await api.deleteDocument(token, id, project_id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  return {
    documents,
    setDocuments,
    loading,
    error,
    createDocuments,
    deleteDocument,
    refetchDocuments: fetchDocuments,
  };
}
