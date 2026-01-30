import instance from "./instance";

export async function loginUser({ email, password }) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  try {
    const { data } = await instance.post("/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return data; // Access token
  } catch (err) {
    const message = err.response?.data?.detail || "Login failed";
    throw new Error(message);
  }
}

export async function signupUser(payload) {
  try {
    const { data } = await instance.post("/users/", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (err) {
    throw err.response?.data || { detail: "Signup failed" };
  }
}

export async function getCurrentUser(token) {
  try {
    const { data } = await instance.get("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data; // User details
  } catch (err) {
    const message = err.response?.data?.detail || "Failed to get user";
    throw new Error(message);
  }
}
