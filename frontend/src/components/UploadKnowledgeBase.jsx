import { Upload, FileText, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useUI } from "../hooks/useUI";

export function UploadKnowledgeBase() {
  const { isSidebarOpen, setIsUploadModalOpen, selectedProject } = useUI();
  return (
    <div className="animate-fade-in flex flex-1 flex-col">
      <header
        className={`border-border bg-card/50 border-b px-6 py-6 backdrop-blur-sm ${!isSidebarOpen ? "pl-14" : ""}`}
      >
        <h1 className="text-foreground font-semibold">
          {selectedProject?.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          Upload a knowledge base to get started
        </p>
      </header>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <div className="bg-accent mx-auto flex h-20 w-20 items-center justify-center rounded-2xl">
              <Sparkles className="text-accent-foreground h-10 w-10" />
            </div>
            <h2 className="text-foreground text-2xl font-semibold">
              Start with your knowledge base
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Upload documents to create your knowledge base. Once uploaded, you
              can start chatting and asking questions about your content.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => {
                setIsUploadModalOpen(true);
              }}
              variant="upload"
              size="xl"
              className="w-full"
            >
              <Upload className="h-5 w-5" />
              Upload Knowledge Base
            </Button>

            <div className="text-muted-foreground flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                PDF, TXT, MD
              </span>
              <span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
              <span>Up to 50MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
