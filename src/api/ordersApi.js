import http from "../lib/miniAxios";

export async function fetchMyOrders(userId) {
  const { data } = await http.get("/get_orders", {
    params: { user_id: userId },
  });
  return data;
}
