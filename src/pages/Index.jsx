import { useLoaderData, redirect, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useHealth } from "../hooks/useHealth.js";
import { useProjects } from "../hooks/useProjects.js";
import { useDocuments } from "../hooks/useDocuments.js";
import { useProgress } from "../hooks/useProgress.js";
import { ProjectSidebar } from "../components/ProjectSidebar.jsx";
import { UploadKnowledgeBase } from "../components/UploadKnowledgeBase";
import { UploadModal } from "../components/UploadModal";
import { ChatInterface } from "../components/ChatInterface";
import { EmptyState } from "../components/EmptyState";
import { NewProjectModal } from "../components/NewProjectModal";
import { ProcessingTimeline } from "../components/ProcessingTimeline";
import { ViewKnowledgeBaseModal } from "../components/ViewKnowledgeBaseModal.jsx";
import { DocumentUploadStatus } from "../components/DocumentUploadStatus.jsx";
import { ThemeToggle } from "../components/ThemeToggle";
import { UserMenu } from "../components/UserMenu";
import { Button } from "../components/ui/button";
import { PanelLeft, Database } from "lucide-react";

export default function Index() {
  const token = localStorage.getItem("token");
  const { health: systemHealth, refetchHealth } = useHealth();
  const {
    projects,
    setProjects,
    loading,
    createProject,
    updateProject,
    processProject,
    deleteProject,
  } = useProjects(token);

  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) ?? null;

  const { documents, createDocuments, deleteDocument, refetchDocuments } =
    useDocuments(token, selectedProjectId);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isViewKnowledgeBaseOpen, setIsViewKnowledgeBaseOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { progress, refetchProgress } = useProgress(token, selectedProjectId);

  const handleCreateProject = async (name) => {
    const project = await createProject(name);
    setSelectedProjectId(project.id);
  };

  const handleSelectProject = (project) => {
    setSelectedProjectId(project.id);
  };

  const handleRenameProject = async (projectId, newName) => {
    await updateProject(projectId, newName);
  };

  const handleDeleteProject = async (projectId) => {
    await deleteProject(projectId);
    setSelectedProjectId((prev) => (prev === projectId ? null : prev));
  };

  const handleUpload = async (files) => {
    if (!selectedProjectId) {
      setIsUploadModalOpen(false);
      return;
    }

    await createDocuments(files);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProjectId
          ? {
              ...p,
              status: "uploaded",
            }
          : p,
      ),
    );
    setIsUploadModalOpen(false);
  };

  const handleUploadMore = () => {
    setIsUploadModalOpen(true);
  };

  const handleStartProcessing = async () => {
    if (!selectedProjectId) return;

    await processProject(selectedProjectId);
    refetchProgress();
  };

  useEffect(() => {
    if (!selectedProject) return;

    if (selectedProject.status === "ready") {
      refetchDocuments();
    }
  }, [selectedProject?.status]);

  const renderMainContent = () => {
    if (!selectedProject) {
      return <EmptyState onNewProject={() => setIsNewProjectModalOpen(true)} />;
    }

    if (selectedProject.status == "ready") {
      return (
        <ChatInterface
          key={selectedProject.id}
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          isSidebarOpen={isSidebarOpen}
          systemHealth={systemHealth}
        />
      );
    }

    if (selectedProject.status == "processing") {
      return (
        <ProcessingTimeline
          projectName={selectedProject.name}
          isSidebarOpen={isSidebarOpen}
          progress={progress}
        />
      );
    }

    if (selectedProject.status == "uploaded") {
      return (
        <DocumentUploadStatus
          documents={documents}
          projectName={selectedProject.name}
          isSidebarOpen={isSidebarOpen}
          onUploadMore={handleUploadMore}
          onStartProcessing={async () => {
            const response = await refetchHealth();

            const modelReady = response?.services.gpu_service === "healthy";
            if (!modelReady) return;

            handleStartProcessing();
          }}
          deleteDocument={deleteDocument}
          onAllFilesRemoved={() => {
            if (selectedProjectId) {
              setProjects((prev) =>
                prev.map((p) =>
                  p.id === selectedProjectId ? { ...p, status: "created" } : p,
                ),
              );
            }
          }}
          systemHealth={systemHealth}
        />
      );
    }

    return (
      <UploadKnowledgeBase
        projectName={selectedProject.name}
        onUploadClick={() => setIsUploadModalOpen(true)}
        isSidebarOpen={isSidebarOpen}
      />
    );
  };

  return (
    <div className="bg-background flex h-screen w-full">
      {isSidebarOpen && (
        <ProjectSidebar
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
          onNewProject={() => setIsNewProjectModalOpen(true)}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {selectedProject?.status == "ready" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsViewKnowledgeBaseOpen(true)}
              className="gap-2"
            >
              <Database className="h-4 w-4" />
              View Knowledge Base
            </Button>
          )}
          <ThemeToggle />
          <UserMenu />
        </div>
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3 left-3 z-10"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
        {renderMainContent()}
      </main>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <ViewKnowledgeBaseModal
        documents={documents}
        deleteDocument={deleteDocument}
        isOpen={isViewKnowledgeBaseOpen}
        onClose={() => setIsViewKnowledgeBaseOpen(false)}
        onKnowledgeBaseEmpty={() => {
          if (selectedProjectId) {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === selectedProjectId ? { ...p, status: "created" } : p,
              ),
            );
          }
        }}
      />
    </div>
  );
}

export async function loader() {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/login");
  }

  try {
    const response = await fetch("http://localhost:5000/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      localStorage.removeItem("token");
      return redirect("/login");
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Auth check failed:", error);
    localStorage.removeItem("token");
    return redirect("/login");
  }
}
