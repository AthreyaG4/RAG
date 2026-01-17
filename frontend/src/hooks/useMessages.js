import { useEffect, useState } from "react";
import * as api from "../api/messages";

export function useMessages(token, project_id) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    async function fetchMessages() {
      try {
        const response = await api.getMessages(token, project_id);
        setMessages(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [token, project_id]);

  async function createMessage(content) {
    const optimisticUserMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);

    try {
      setLoading(true);
      const serverMessages = await api.createMessage(
        token,
        content,
        project_id,
      );

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== optimisticUserMessage.id)
          .concat(serverMessages),
      );
      setLoading(false);
      return serverMessages;
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticUserMessage.id ? { ...m, error: true } : m,
        ),
      );
      setLoading(false);
      throw err;
    }
  }

  return {
    messages,
    setMessages,
    loading,
    setLoading,
    error,
    setError,
    createMessage,
  };
}
