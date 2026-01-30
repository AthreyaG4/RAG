import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ChevronDown, ChevronRight, Trash2, FileText } from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";
import { useUI } from "../hooks/useUI";
import { useProjects } from "../hooks/useProjects";

export function ViewKnowledgeBaseModal() {
  const { isViewKnowledgeBaseOpen, setIsViewKnowledgeBaseOpen } = useUI();
  const { documents, deleteDocument } = useDocuments();
  const { selectedProjectId, markProjectCreated } = useProjects();

  const [expandedDocs, setExpandedDocs] = useState({});

  const toggleExpanded = (docId) => {
    setExpandedDocs((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const handleDeleteDocument = async (docId) => {
    const newDocs = documents.filter((doc) => doc.id !== docId);
    await deleteDocument(docId);
    if (newDocs.length === 0) {
      setIsViewKnowledgeBaseOpen(false);
      if (selectedProjectId) {
        markProjectCreated(selectedProjectId);
      }
    }
  };

  return (
    <Dialog
      open={isViewKnowledgeBaseOpen}
      onOpenChange={() => {
        setIsViewKnowledgeBaseOpen(false);
      }}
    >
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Knowledge Base Documents</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
          {documents.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No documents in knowledge base
            </p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="border-border overflow-hidden rounded-lg border"
              >
                <div
                  className="bg-muted/50 hover:bg-muted flex cursor-pointer items-center justify-between p-3 transition-colors"
                  onClick={() => toggleExpanded(doc.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedDocs[doc.id] ? (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    )}
                    <FileText className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">{doc.filename}</span>
                    <span className="text-muted-foreground text-xs">
                      ({doc.chunks.length} chunks)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {expandedDocs[doc.id] && (
                  <div className="border-border border-t">
                    {doc.chunks.map((chunk, index) => (
                      <div
                        key={chunk.id}
                        className="border-border bg-background border-b p-3 last:border-b-0"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            Chunk {index + 1}
                          </span>
                          <div className="flex gap-1">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs ${
                                chunk.has_text
                                  ? "bg-primary/10 text-primary border-primary/30"
                                  : "bg-muted text-muted-foreground/50 border-border"
                              }`}
                            >
                              text
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs ${
                                chunk.has_image
                                  ? "border-purple-500/30 bg-purple-500/10 text-purple-500"
                                  : "bg-muted text-muted-foreground/50 border-border"
                              }`}
                            >
                              image
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs ${
                                chunk.has_table
                                  ? "border-red-500/30 bg-red-500/10 text-red-500"
                                  : "bg-muted text-muted-foreground/50 border-border"
                              }`}
                            >
                              table
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
