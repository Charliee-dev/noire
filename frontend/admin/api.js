const API = "https://noire-backend-6ikq.onrender.com";

export async function request(url, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(API + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...(options.headers || {})
    }
  });

  if (!res.ok) throw new Error("API error");

  return res.json();
}