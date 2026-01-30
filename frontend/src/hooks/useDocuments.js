import { useContext } from "react";
import { DocumentsContext } from "../context/DocumentsContext";

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) {
    throw new Error("useDocuments must be used inside DocumentsProvider");
  }
  return ctx;
}
