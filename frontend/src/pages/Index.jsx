import { useUI } from "../hooks/useUI.js";
import { useProjects } from "../hooks/useProjects.js";
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
import { redirect } from "react-router";
import { getCurrentUser } from "../api/auth.js";

export default function Index() {
  const { isSidebarOpen, setIsSidebarOpen, setIsViewKnowledgeBaseOpen } =
    useUI();

  const { selectedProject } = useProjects();

  const renderMainContent = () => {
    if (!selectedProject) {
      return <EmptyState />;
    }

    if (selectedProject.status == "ready") {
      return <ChatInterface />;
    }

    if (selectedProject.status == "uploaded") {
      return <DocumentUploadStatus />;
    }

    if (selectedProject.status == "processing") {
      return <ProcessingTimeline />;
    }

    return <UploadKnowledgeBase />;
  };

  return (
    <div className="bg-background flex h-screen w-full">
      {isSidebarOpen && <ProjectSidebar />}

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="absolute top-4 right-3 z-10 flex items-center gap-2">
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

      <UploadModal />

      <NewProjectModal />

      <ViewKnowledgeBaseModal />
    </div>
  );
}

export async function loader() {
  const token = localStorage.getItem("token");
  if (!token) throw redirect("/login");

  try {
    return await getCurrentUser(token);
  } catch {
    localStorage.removeItem("token");
    throw redirect("/login");
  }
}
