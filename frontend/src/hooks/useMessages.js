import { useEffect, useState } from "react";
import * as api from "../api/messages";
// import crypto from "crypto";

export function useMessages(token, project_id) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (!token) return;

    fetchMessages();
  }, [token, project_id]);

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

    const payload = { role: "user", content: content };

    const response = await fetch(
      `http://localhost:5000/api/projects/${project_id}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const reader = response.body?.getReader();
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
