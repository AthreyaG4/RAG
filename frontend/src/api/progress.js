import instance from "./instance";

export async function getProgress(token, project_id) {
  const { data } = await instance.get(`/projects/${project_id}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
