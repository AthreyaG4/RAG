export async function getProjects(token) {
  const res = await fetch("http://localhost:5000/api/projects", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createProject(token, projectName) {
  const payload = { name: projectName };
  const response = await fetch("http://localhost:5000/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function processProject(token, id) {
  const response = await fetch(
    `http://localhost:5000/api/projects/${id}/process`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.json();
}

export async function updateProject(token, id, updatedName) {
  const payload = { name: updatedName };
  const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function deleteProject(token, id) {
  return fetch(`http://localhost:5000/api/projects/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
