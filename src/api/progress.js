export async function getProgress(token, project_id) {
  const res = await fetch(
    `http://localhost:5000/api/projects/${project_id}/progress`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.json();
}
