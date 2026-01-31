import instance from "./axiosInstance.js";

export async function getHealth() {
  const { data } = await instance.get("/health");
  return data;
}
