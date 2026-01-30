import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useUI } from "../hooks/useUI";
import { useProjects } from "../hooks/useProjects";

export function NewProjectModal() {
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  const { isNewProjectModalOpen, setIsNewProjectModalOpen } = useUI();
  const { createProject, setSelectedProjectId } = useProjects();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = projectName.trim();

    if (!trimmedName) {
      setError("Project name is required");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Project name must be less than 100 characters");
      return;
    }

    const project = await createProject(trimmedName);
    setSelectedProjectId(project.id);

    setProjectName("");
    setError("");
    setIsNewProjectModalOpen(false);
  };

  const handleClose = () => {
    setProjectName("");
    setError("");
    setIsNewProjectModalOpen(false);
  };

  return (
    <Dialog open={isNewProjectModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="text-primary h-5 w-5" />
            Create New Project
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex flex-col gap-3">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                setError("");
              }}
              placeholder="Enter project name..."
              autoFocus
              maxLength={100}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
