import {
  Check,
  Loader2,
  FileText,
  Scissors,
  Sparkles,
  Database,
} from "lucide-react";
import { cn } from "../lib/utils";

export function ProcessingTimeline({
  projectName,
  isSidebarOpen = true,
  progress,
}) {
  if (!progress) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  const { documents, total_documents, documents_processed } = progress;

  const getDocStatus = (doc) => {
    if (doc.status === "uploaded") {
      return {
        label: "Waiting",
        icon: FileText,
        color: "text-muted-foreground",
      };
    }
    if (doc.status === "chunking") {
      return { label: "Chunking", icon: Scissors, color: "text-primary" };
    }
    if (doc.status === "processing") {
      return { label: "Processing", icon: Sparkles, color: "text-primary" };
    }
    if (doc.status === "ready") {
      return { label: "Complete", icon: Check, color: "text-primary" };
    }
    if (doc.status === "failed") {
      return { label: "Failed", icon: FileText, color: "text-destructive" };
    }
    return { label: "Processing", icon: Sparkles, color: "text-primary" };
  };

  const getOverallProgress = () => {
    if (total_documents === 0) return 0;
    return Math.round((documents_processed / total_documents) * 100);
  };

  const allDocsComplete =
    documents_processed === total_documents && total_documents > 0;

  return (
    <div className="animate-fade-in flex flex-1 flex-col">
      <header
        className={cn(
          "border-border bg-card/50 border-b px-6 py-4 backdrop-blur-sm",
          !isSidebarOpen && "pl-14",
        )}
      >
        <h1 className="text-foreground font-semibold">{projectName}</h1>
        <p className="text-muted-foreground text-sm">
          {allDocsComplete
            ? "Knowledge base ready!"
            : "Processing your knowledge base..."}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2/5 space-y-4">
          {/* Overall progress header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  allDocsComplete
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary",
                )}
              >
                {allDocsComplete ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Database className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-foreground font-medium">
                  {allDocsComplete
                    ? "Knowledge Base Ready"
                    : "Building Knowledge Base"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {documents_processed} of {total_documents} documents processed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-foreground text-2xl font-semibold">
                {getOverallProgress()}%
              </p>
              <p className="text-muted-foreground text-xs">Overall progress</p>
            </div>
          </div>

          {/* Document list */}
          <div className="space-y-3">
            {documents.map((doc) => {
              const status = getDocStatus(doc);
              const StatusIcon = status.icon;
              const isDocComplete = doc.status === "ready";
              const isChunking = doc.status === "chunking";
              const isProcessing = doc.status === "processing";
              const isPending = doc.status === "uploaded";
              const isFailed = doc.status === "failed";

              return (
                <div
                  key={doc.id}
                  className={cn(
                    "rounded-xl border p-4 transition-all duration-300",
                    isDocComplete && "bg-primary/5 border-primary/20",
                    isFailed && "bg-destructive/5 border-destructive/20",
                    !isDocComplete && !isFailed && "bg-card border-border",
                  )}
                >
                  {/* Document header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                          isDocComplete && "bg-primary text-primary-foreground",
                          isFailed &&
                            "bg-destructive text-destructive-foreground",
                          isChunking && "bg-primary/20 text-primary",
                          isProcessing && "bg-accent text-accent-foreground",
                          isPending && "bg-muted text-muted-foreground",
                        )}
                      >
                        {isDocComplete ? (
                          <Check className="h-4 w-4" />
                        ) : isChunking ? (
                          <Scissors className="h-4 w-4 animate-pulse" />
                        ) : isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <StatusIcon className="h-4 w-4" />
                        )}
                      </div>
                      <p className="text-foreground truncate font-medium">
                        {doc.filename}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                        isDocComplete && "bg-primary/10 text-primary",
                        isFailed && "bg-destructive/10 text-destructive",
                        isChunking && "bg-primary/10 text-primary",
                        isProcessing && "bg-accent text-accent-foreground",
                        isPending && "bg-muted text-muted-foreground",
                      )}
                    >
                      {isChunking && (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Chunking
                        </span>
                      )}
                      {isPending && "Waiting"}
                      {isDocComplete && "Complete"}
                      {isFailed && "Failed"}
                      {isProcessing && (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {doc.total_chunks
                            ? `${doc.total_chunks} chunks`
                            : "Processing"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress section - only show when processing */}
                  {(isProcessing || isDocComplete) && doc.total_chunks && (
                    <div className="border-border/50 mt-3 space-y-2.5 border-t pt-3">
                      {/* Summarizing progress */}
                      <div className="flex items-center gap-3">
                        <div className="flex w-24 shrink-0 items-center gap-2">
                          <Sparkles
                            className={cn(
                              "h-3.5 w-3.5",
                              doc.chunks_summarized === doc.total_chunks
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          <span className="text-muted-foreground text-xs">
                            Summarize
                          </span>
                        </div>
                        <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                          <div
                            className="bg-primary/60 h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${(doc.chunks_summarized / doc.total_chunks) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-muted-foreground w-12 text-right text-xs">
                          {doc.chunks_summarized}/{doc.total_chunks}
                        </span>
                      </div>

                      {/* Embedding progress */}
                      <div className="flex items-center gap-3">
                        <div className="flex w-24 shrink-0 items-center gap-2">
                          <Database
                            className={cn(
                              "h-3.5 w-3.5",
                              doc.chunks_embedded === doc.total_chunks
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          <span className="text-muted-foreground text-xs">
                            Embed
                          </span>
                        </div>
                        <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                          <div
                            className="bg-primary/80 h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${(doc.chunks_embedded / doc.total_chunks) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-muted-foreground w-12 text-right text-xs">
                          {doc.chunks_embedded}/{doc.total_chunks}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Chunking indicator - pulsing dots */}
                  {isChunking && (
                    <div className="border-border/50 mt-3 border-t pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          Analyzing document structure
                        </span>
                        <div className="flex gap-1">
                          <span
                            className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Failed message */}
                  {isFailed && (
                    <div className="border-border/50 mt-3 border-t pt-3">
                      <p className="text-destructive text-xs">
                        Failed to process this document
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
