import instance from "./instance";

export async function getMessages(token, project_id) {
  const { data } = await instance.get(`/projects/${project_id}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function createMessage(token, content, project_id) {
  const payload = { role: "user", content: content };
  const { data } = await instance.post(`/projects/${project_id}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
    data: payload,
  });
  return data;
}
