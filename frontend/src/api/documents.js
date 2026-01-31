import instance from "./axiosInstance.js";

export async function getDocuments(token, project_id) {
  const { data } = await instance.get(`/projects/${project_id}/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function createDocuments(token, files, project_id) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("documents", file);
  });

  const { data } = await instance.post(
    `/projects/${project_id}/documents`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}

export async function deleteDocument(token, id, project_id) {
  return await instance.delete(`/projects/${project_id}/documents/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
