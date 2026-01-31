import { useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  // Mock total pages - in real implementation this would come from the PDF
  const totalPages = 15;

  useEffect(() => {
    // Trigger animation on mount
    requestAnimationFrame(() => setIsVisible(true));

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className={`bg-background/80 absolute inset-0 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      <div
        className={`bg-card border-border relative flex h-full w-full max-w-xl flex-col border-l shadow-2xl transition-transform duration-200 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="border-border bg-card flex items-center justify-between border-b px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <FileText className="text-primary h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-foreground truncate text-sm font-semibold">
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
            onClick={handleClose}
            className="hover:bg-destructive/10 hover:text-destructive h-9 w-9 shrink-0 rounded-xl"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-border/50 bg-muted/30 flex items-center justify-between border-b px-4 py-2.5">
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
            <span className="text-muted-foreground min-w-15 px-3 text-center text-xs font-medium">
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
            <span className="text-muted-foreground min-w-12.5 px-2 text-center text-xs font-medium">
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

        <div className="bg-muted/20 flex-1 overflow-auto p-4">
          <iframe
            src="https://cdn.codewithmosh.com/image/upload/v1721763853/guides/web-roadmap.pdf#toolbar=0"
            className="h-full w-full border-0"
            title="PDF Viewer"
          />
        </div>

        <div className="border-border bg-accent/30 border-t px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary h-full min-h-10 w-1 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
                Referenced excerpt
              </p>
              <p className="text-foreground line-clamp-3 text-sm leading-relaxed">
                "{citation.snippet}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
