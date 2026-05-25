import { request } from "./api.js";
import { renderList } from "./ui.js";

export async function loadOrders() {
  const box = document.getElementById("orders");

  try {
    const orders = await request("/api/order/admin");

    renderList(box, orders.map(o => `
      <div class="list-item">
        <span>Order #${o._id.slice(-6)}</span>
        <span>₹${o.total}</span>
      <select data-id="${o._id}">
  <option ${o.status==="Placed"?"selected":""}>Placed</option>
  <option ${o.status==="Paid"?"selected":""}>Paid</option>
  <option ${o.status==="Shipped"?"selected":""}>Shipped</option>
  <option ${o.status==="Delivered"?"selected":""}>Delivered</option>
</select>
      </div>
    `).join(""));

    bind();

  } catch {
    renderList(box, "Error loading orders");
  }
}

function bind() {
  document.querySelectorAll("select").forEach(sel => {
    sel.onchange = () => update(sel.dataset.id, sel.value);
  });
}

async function update(id, status) {
  await request(`/api/order/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });
}