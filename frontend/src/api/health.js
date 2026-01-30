import instance from "./instance";

export async function getHealth() {
  const { data } = await instance.get("/health");
  return data;
}
