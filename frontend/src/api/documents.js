export async function getDocuments(token, project_id) {
  const res = await fetch(
    `http://localhost:5000/api/projects/${project_id}/documents`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.json();
}

export async function createDocuments(token, files, project_id) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("documents", file);
  });

  const response = await fetch(
    `http://localhost:5000/api/projects/${project_id}/documents`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  return response.json();
}

export async function deleteDocument(token, id, project_id) {
  return fetch(
    `http://localhost:5000/api/projects/${project_id}/documents/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
