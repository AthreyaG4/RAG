export async function getChunks(token, project_id, document_id) {
  const res = await fetch(
    `http://localhost:5000/api/projects/${project_id}/documents/${document_id}/chunks`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.json();
}
