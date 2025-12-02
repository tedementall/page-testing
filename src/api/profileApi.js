import http from "../lib/miniAxios";

export async function fetchMyProfile() {
  const { data } = await http.get("/auth/me");
  return data;
}

export async function updateMyProfile(payload) {
  const { data } = await http.post("/auth/update", payload);
  return data;
}
