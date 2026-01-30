import { createContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProjects } from "../hooks/useProjects";
import * as api from "../api/messages";

export const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token, logout } = useAuth();
  const { selectedProjectId } = useProjects();

  async function fetchMessages() {
    try {
      const response = await api.getMessages(token, selectedProjectId);
      setMessages(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token || !selectedProjectId) return;

    fetchMessages();
  }, [token, selectedProjectId]);

  async function createMessage(content) {
    const userMessage = { role: "user", content, id: self.crypto.randomUUID() };
    setMessages((prev) => [...prev, userMessage]);

    const assistantID = self.crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        id: assistantID,
      },
    ]);

    const { data } = await api.createMessage(token, content, project_id);

    const reader = data.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = JSON.parse(line.slice(6));

          if (data.content) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantID
                  ? { ...msg, content: msg.content + data.content }
                  : msg,
              ),
            );
          }

          if (data.done) {
            fetchMessages();
          }
        }
      }
    }

    return;
  }

  return (
    <MessagesContext.Provider
      value={{
        messages,
        messagesLoading: loading,
        messagesError: error,
        refetchMessages: fetchMessages,
        createMessage,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}
