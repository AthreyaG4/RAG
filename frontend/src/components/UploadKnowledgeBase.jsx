import { Upload, FileText, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export function UploadKnowledgeBase({ projectName, onUploadClick, isSidebarOpen = true }) {
  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <header className={`px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm ${!isSidebarOpen ? "pl-14" : ""}`}>
        <h1 className="font-semibold text-foreground">{projectName}</h1>
        <p className="text-sm text-muted-foreground">Upload a knowledge base to get started</p>
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-accent flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Start with your knowledge base</h2>
            <p className="text-muted-foreground leading-relaxed">
              Upload documents to create your knowledge base. Once uploaded, you can start chatting and asking questions about your
              content.
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={onUploadClick} variant="upload" size="xl" className="w-full">
              <Upload className="w-5 h-5" />
              Upload Knowledge Base
            </Button>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                PDF, TXT, MD
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>Up to 50MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
