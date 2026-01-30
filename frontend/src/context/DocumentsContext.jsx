import { createContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProjects } from "../hooks/useProjects";
import * as api from "../api/documents";

export const DocumentsContext = createContext(null);

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token, logout } = useAuth();
  const { selectedProjectId, selectedProject } = useProjects();

  const fetchDocuments = async () => {
    try {
      // console.log(`Fetching Documents for project: ${project_id}.....`);
      const response = await api.getDocuments(token, selectedProjectId);
      setDocuments(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedProjectId) return;

    if (selectedProject.status === "ready") {
      fetchDocuments();
    }
  }, [selectedProject?.status]);

  useEffect(() => {
    if (!token || !selectedProjectId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    fetchDocuments();
  }, [token, selectedProjectId]);

  async function createDocuments(files) {
    // console.log(`Creating Documents for project: ${project_id}.....`);
    const createdDocuments = await api.createDocuments(
      token,
      files,
      selectedProjectId,
    );
    setDocuments((prev) => prev.concat(createdDocuments));
    return createdDocuments;
  }

  async function deleteDocument(id) {
    // console.log(`Deleting Document: ${id} for project: ${project_id}.....`);
    await api.deleteDocument(token, id, selectedProjectId);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        documentsLoading: loading,
        documentsError: error,
        refetchDocuments: fetchDocuments,
        createDocuments,
        deleteDocument,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}
