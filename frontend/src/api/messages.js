import instance from "./axiosInstance.js";
import { API_BASE_URL } from "./axiosInstance.js";
import { handleUnauthorized } from "../lib/authEvents.js";

export async function getMessages(token, project_id) {
  const { data } = await instance.get(`/projects/${project_id}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function viewCitation(token, projectId, messageId, citationId) {
  const { data } = await instance.get(
    `/projects/${projectId}/messages/${messageId}/citations/${citationId}/view`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
}

export async function createMessage(
  token,
  content,
  project_id,
  hybridSearch,
  graphSearch,
  reranking,
) {
  const response = await fetch(
    `${API_BASE_URL}/projects/${project_id}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: "user",
        content,
        hybridSearch,
        graphSearch,
        reranking,
      }),
    },
  );

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response;
}
