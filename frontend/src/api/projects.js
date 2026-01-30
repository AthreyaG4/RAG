import instance from "./instance";

export async function getProjects(token) {
  const { data } = await instance.get("/projects", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function createProject(token, projectName) {
  const payload = { name: projectName };

  const { data } = await instance.post("/projects", payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function processProject(token, id) {
  const { data } = await instance.post(`/projects/${id}/process`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function updateProject(token, id, updatedName) {
  const payload = { name: updatedName };

  const { data } = await instance.patch(`/projects/${id}`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function deleteProject(token, id) {
  const { data } = await instance.delete(`/projects/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
