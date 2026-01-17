export async function getHealth() {
  const res = await fetch(
    `http://localhost:5000/api/health`
  );
  return res.json();
}