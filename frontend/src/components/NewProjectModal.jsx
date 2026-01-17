import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function NewProjectModal({ isOpen, onClose, onCreateProject }) {
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
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

    onCreateProject(trimmedName);
    setProjectName("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setProjectName("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
