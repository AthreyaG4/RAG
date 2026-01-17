import { useState } from "react";
import {
  Plus,
  FolderOpen,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Check,
  PanelLeftClose,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";

export function ProjectSidebar({
  projects,
  selectedProject,
  onSelectProject,
  onNewProject,
  onRenameProject,
  onDeleteProject,
  onClose,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleStartRename = (project, e) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleConfirmRename = (projectId) => {
    if (editName.trim()) {
      onRenameProject(projectId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleKeyDown = (e, projectId) => {
    if (e.key === "Enter") {
      handleConfirmRename(projectId);
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  };

  const readyProjects = projects.filter((p) => p.status === "ready");
  const pendingProjects = projects.filter((p) => p.status !== "ready");

  return (
    <aside className="from-sidebar to-sidebar/95 border-sidebar-border animate-slide-in flex h-screen w-72 flex-col border-r bg-gradient-to-b">
      {/* Header */}
      <div className="border-sidebar-border/50 border-b p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="from-primary to-primary/80 shadow-primary/20 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
              <MessageSquare className="text-primary-foreground h-5 w-5" />
            </div>
            <div>
              <span className="text-sidebar-foreground text-lg font-bold">
                RAG Chat
              </span>
              <p className="text-muted-foreground text-xs">
                Knowledge Assistant
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-sidebar-accent h-8 w-8 rounded-lg"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={onNewProject}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 h-11 w-full justify-center gap-2 rounded-xl font-medium shadow-md"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Projects List */}
      <div className="flex-1 space-y-6 overflow-y-auto p-3">
        {/* Ready Projects */}
        {readyProjects.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 px-2">
              <Sparkles className="text-primary h-3.5 w-3.5" />
              <p className="text-primary text-xs font-semibold tracking-wider uppercase">
                Ready
              </p>
              <span className="text-muted-foreground bg-sidebar-accent ml-auto rounded-full px-2 py-0.5 text-xs">
                {readyProjects.length}
              </span>
            </div>
            <nav className="space-y-1">
              {readyProjects.map((project, index) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                  isEditing={editingId === project.id}
                  editName={editName}
                  onSelect={() => onSelectProject(project)}
                  onStartRename={(e) => handleStartRename(project, e)}
                  onConfirmRename={() => handleConfirmRename(project.id)}
                  onCancelRename={handleCancelRename}
                  onEditNameChange={setEditName}
                  onKeyDown={(e) => handleKeyDown(e, project.id)}
                  onDelete={() => onDeleteProject(project.id)}
                  animationDelay={index * 50}
                />
              ))}
            </nav>
          </div>
        )}

        {/* Pending Projects */}
        {pendingProjects.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 px-2">
              <FolderOpen className="text-muted-foreground h-3.5 w-3.5" />
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Pending
              </p>
              <span className="text-muted-foreground bg-sidebar-accent ml-auto rounded-full px-2 py-0.5 text-xs">
                {pendingProjects.length}
              </span>
            </div>
            <nav className="space-y-1">
              {pendingProjects.map((project, index) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                  isEditing={editingId === project.id}
                  editName={editName}
                  onSelect={() => onSelectProject(project)}
                  onStartRename={(e) => handleStartRename(project, e)}
                  onConfirmRename={() => handleConfirmRename(project.id)}
                  onCancelRename={handleCancelRename}
                  onEditNameChange={setEditName}
                  onKeyDown={(e) => handleKeyDown(e, project.id)}
                  onDelete={() => onDeleteProject(project.id)}
                  animationDelay={index * 50}
                />
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-sidebar-border/50 bg-sidebar-accent/30 border-t p-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="bg-primary h-2 w-2 animate-pulse rounded-full" />
            <span className="text-muted-foreground text-xs">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ProjectItem({
  project,
  isSelected,
  isEditing,
  editName,
  onSelect,
  onStartRename,
  onConfirmRename,
  onCancelRename,
  onEditNameChange,
  onKeyDown,
  onDelete,
  animationDelay,
}) {
  return (
    <div
      className={cn(
        "group transition-smooth flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm",
        "hover:bg-sidebar-accent/80",
        isSelected
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
          : "text-sidebar-foreground",
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={onSelect}
    >
      <div
        className={cn(
          "transition-smooth flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isSelected
            ? "bg-primary/15"
            : "bg-sidebar-accent group-hover:bg-primary/10",
        )}
      >
        <FolderOpen
          className={cn(
            "transition-smooth h-4 w-4",
            isSelected
              ? "text-primary"
              : "text-muted-foreground group-hover:text-primary",
          )}
        />
      </div>

      {isEditing ? (
        <div
          className="flex flex-1 items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="bg-background border-input focus:ring-ring flex-1 rounded-lg border px-2.5 py-1 text-sm focus:ring-2 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onConfirmRename}
            className="hover:bg-primary/10 transition-smooth rounded-lg p-1.5"
          >
            <Check className="text-primary h-3.5 w-3.5" />
          </button>
          <button
            onClick={onCancelRename}
            className="hover:bg-destructive/10 transition-smooth rounded-lg p-1.5"
          >
            <X className="text-muted-foreground h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate">{project.name}</span>

          {project.hasKnowledgeBase && (
            <span className="bg-primary shadow-primary/30 h-2 w-2 shrink-0 rounded-full shadow-sm" />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="hover:bg-sidebar-accent-foreground/10 rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem
                onClick={(e) => onStartRename(e)}
                className="rounded-lg"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive rounded-lg"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
