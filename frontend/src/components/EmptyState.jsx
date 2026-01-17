import { FolderPlus, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export function EmptyState({ onNewProject }) {
  return (
    <div className="animate-fade-in flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="bg-accent mx-auto flex h-20 w-20 items-center justify-center rounded-2xl">
            <Sparkles className="text-accent-foreground h-10 w-10" />
          </div>
          <h2 className="text-foreground text-2xl font-semibold">
            Welcome to RAG Chat
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Create a new project to get started. Upload your documents and start
            asking questions about your content.
          </p>
        </div>

        <Button
          onClick={onNewProject}
          variant="upload"
          size="xl"
          className="w-full"
        >
          <FolderPlus className="h-5 w-5" />
          Create New Project
        </Button>
      </div>
    </div>
  );
}
