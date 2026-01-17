export async function getMessages(token, project_id) {
  const res = await fetch(
    `http://localhost:5000/api/projects/${project_id}/messages`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.json();
}

export async function createMessage(token, content, project_id) {
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

  return response.json();
}
