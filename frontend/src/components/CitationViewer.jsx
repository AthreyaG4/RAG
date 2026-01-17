import { useState } from "react";
import {
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "../components/ui/button";

export function CitationViewer({ citation, onClose }) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(citation.pageNumber);

  // Mock total pages - in real implementation this would come from the PDF
  const totalPages = 15;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="bg-card animate-fade-in flex h-full flex-col">
      {/* Header */}
      <div className="border-border bg-card/80 flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <FileText className="text-primary h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-foreground truncate text-sm font-medium">
              {citation.documentName}
            </h3>
            <p className="text-muted-foreground text-xs">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 shrink-0 rounded-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <div className="border-border/50 bg-muted/30 flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground min-w-15 px-2 text-center text-xs">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="h-8 w-8 rounded-lg"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground min-w-12.5 px-2 text-center text-xs">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="h-8 w-8 rounded-lg"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Preview Area */}
      <div className="bg-muted/20 flex-1 overflow-auto p-4">
        <div
          className="bg-background border-border transition-smooth mx-auto overflow-hidden rounded-lg border shadow-sm"
          style={{
            width: `${Math.min(zoom * 4, 800)}px`,
            maxWidth: "100%",
          }}
        >
          {/* Simulated PDF page */}
          <div className="flex aspect-[8.5/11] flex-col p-8">
            {/* Simulated content */}
            <div className="space-y-4">
              <div className="bg-muted h-3 w-3/4 rounded" />
              <div className="bg-muted h-3 w-full rounded" />
              <div className="bg-muted h-3 w-5/6 rounded" />
              <div className="bg-muted h-3 w-full rounded" />
              <div className="bg-muted h-3 w-2/3 rounded" />

              <div className="my-6" />

              {/* Highlighted citation area */}
              <div className="relative">
                <div className="bg-primary/10 border-primary/30 absolute -inset-2 rounded-lg border-2" />
                <div className="relative space-y-2 p-2">
                  <div className="bg-primary/30 h-3 w-full rounded" />
                  <div className="bg-primary/30 h-3 w-4/5 rounded" />
                  <div className="bg-primary/30 h-3 w-full rounded" />
                </div>
              </div>

              <div className="my-6" />

              <div className="bg-muted h-3 w-full rounded" />
              <div className="bg-muted h-3 w-3/4 rounded" />
              <div className="bg-muted h-3 w-5/6 rounded" />
              <div className="bg-muted h-3 w-full rounded" />
              <div className="bg-muted h-3 w-1/2 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Citation Snippet Footer */}
      <div className="border-border bg-accent/30 border-t px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="bg-primary h-full min-h-10 w-1 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground mb-1 text-xs font-medium">
              Referenced excerpt
            </p>
            <p className="text-foreground line-clamp-3 text-sm leading-relaxed">
              "{citation.snippet}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
