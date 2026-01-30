import { useContext } from "react";
import { MessagesContext } from "../context/MessagesContext";

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error("useMessages must be used inside MessagesProvider");
  }
  return ctx;
}
