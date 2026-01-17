import { FileText } from "lucide-react";
import { cn } from "../lib/utils";

export function CitationBadge({ citation, index, onClick, isActive }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
        "transition-smooth group cursor-pointer border",
        isActive
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-accent/50 text-accent-foreground border-accent hover:bg-accent hover:border-primary/30",
      )}
    >
      <FileText className="h-3 w-3" />
      <span className="max-w-30 truncate">{citation.documentName}</span>
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] font-semibold",
          isActive ? "bg-primary-foreground/20" : "bg-primary/10 text-primary",
        )}
      >
        p.{citation.pageNumber}
      </span>
    </button>
  );
}
