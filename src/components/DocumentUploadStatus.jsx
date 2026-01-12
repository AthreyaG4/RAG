import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  Play,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export function DocumentUploadStatus({
  documents,
  projectName,
  isSidebarOpen,
  onUploadMore,
  onStartProcessing,
  deleteDocument,
  onAllFilesRemoved,
}) {
  const uploadedCount =
    documents?.filter((doc) => doc.status === "uploaded").length || 0;
  const failedCount =
    documents?.filter((doc) => doc.status === "failed").length || 0;
  const hasuploadedfulUploads = uploadedCount > 0;

  const [documentToRemove, setDocumentToRemove] = useState(null);

  const handleRemoveFile = (doc) => {
    setDocumentToRemove(doc);
  };

  const confirmRemove = () => {
    if (!documentToRemove) return;

    const isLastFile = documents.length === 1;

    deleteDocument?.(documentToRemove.id);

    setDocumentToRemove(null);

    if (isLastFile) {
      onAllFilesRemoved?.();
    }
  };

  return (
    <>
      <div
        className={cn(
          "animate-fade-in flex flex-1 flex-col items-center justify-center p-8 transition-all duration-300",
          isSidebarOpen ? "ml-0" : "ml-0",
        )}
      >
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
              <FileText className="text-primary h-8 w-8" />
            </div>
            <h2 className="text-foreground mb-2 text-2xl font-semibold">
              {projectName}
            </h2>
            <p className="text-muted-foreground text-sm">
              {uploadedCount} of {documents?.length || 0} file
              {documents?.length !== 1 ? "s" : ""} ready
              {failedCount > 0 && (
                <span className="text-destructive">
                  {" "}
                  · {failedCount} failed
                </span>
              )}
            </p>
          </div>

          {/* File List */}
          <div className="bg-card/50 border-border/50 mb-6 overflow-hidden rounded-2xl border backdrop-blur-sm">
            <div className="divide-border/50 max-h-80 divide-y overflow-y-auto">
              {documents?.map((doc) => {
                const status = doc.status;

                return (
                  <div
                    key={doc.id}
                    className="hover:bg-muted/30 group flex items-center gap-3 px-4 py-3 transition-colors"
                  >
                    {/* Status Icon */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        status === "uploaded" && "bg-green-500/10",
                        status === "failed" && "bg-destructive/10",
                      )}
                    >
                      {status === "uploaded" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {status === "failed" && (
                        <AlertCircle className="text-destructive h-4 w-4" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {doc.filename}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : ""}
                      </p>
                    </div>

                    {/* Status Badge */}
                    {status === "uploaded" && (
                      <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                        Ready
                      </span>
                    )}
                    {status === "failed" && (
                      <span className="bg-destructive/10 text-destructive rounded-full px-2 py-1 text-xs font-medium">
                        Failed
                      </span>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFile(doc)}
                      className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-all group-hover:opacity-100"
                      aria-label={`Remove ${doc.filename}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={onUploadMore}
              className="rounded-xl"
            >
              <Upload className="h-4 w-4" />
              Add More
            </Button>

            {hasuploadedfulUploads && (
              <Button
                onClick={onStartProcessing}
                className="bg-primary hover:bg-primary/90 rounded-xl"
              >
                <Play className="h-4 w-4" />
                Start Processing
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={documentToRemove !== null}
        onOpenChange={(open) => !open && setDocumentToRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove File</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{documentToRemove?.filename}"
              from the upload list?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocumentToRemove(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
