import { createContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import * as api from "../api/projects";

export const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || null;

  const { token, logout } = useAuth();

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const response = await api.getProjects(token);
      setProjects(response);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchProjects();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const hasProcessingProjects = projects.some(
      (p) => p.status === "processing",
    );

    if (!hasProcessingProjects) return;

    const interval = setInterval(() => {
      fetchProjects();
    }, 3000);

    return () => clearInterval(interval);
  }, [token, projects]);

  async function createProject(name) {
    const createdProject = await api.createProject(token, name);
    setProjects((prev) => [...prev, createdProject]);
    return createdProject;
  }

  async function updateProject(id, updateName) {
    const updatedProject = await api.updateProject(token, id, updateName);
    setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)));
    return updatedProject;
  }

  async function processProject(id) {
    const processedProject = await api.processProject(token, id);
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? processedProject : p)),
    );
    return processedProject;
  }

  async function deleteProject(id) {
    await api.deleteProject(token, id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function markProjectUploaded(projectId) {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: "uploaded" } : p)),
    );
  }

  function markProjectCreated(projectId) {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: "created" } : p)),
    );
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        setProjects,
        projectsLoading: loading,
        projectsError: error,
        selectedProjectId,
        setSelectedProjectId,
        selectedProject,
        createProject,
        updateProject,
        processProject,
        deleteProject,
        refetchProjects: fetchProjects,
        markProjectUploaded,
        markProjectCreated,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}
