document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("orders-container");

  const token = localStorage.getItem("token");

  if (!token) {
    container.innerHTML = "<p>Please login to see orders</p>";
    return;
  }

  try {
    container.innerHTML = "<p>Loading orders...</p>";
    const res = await fetch("https://noire-backend-6ikq.onrender.com/api/order", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const orders = await res.json();
    container.innerHTML = ""; // ✅ CLEAR LOADING TEXT

    if (!orders || orders.length === 0) {
      container.innerHTML = `
  <div class="empty-state">
    <h3>No Orders Yet</h3>
    <p>Your purchases will appear here.</p>
  </div>
`;
      return;
    }

    orders.forEach(order => {

      const div = document.createElement("div");
      div.classList.add("order-card");

      let itemsHTML = "";

      order.items.forEach(item => {
        itemsHTML += `
<div class="order-item">
  <span>${item.name}</span>
  <span>x${item.qty}</span>
</div>
`;
      });

     div.innerHTML = `
  <div class="order-top">
    <h3>Order #${order._id.slice(-6)}</h3>
    <span class="order-status ${order.status?.toLowerCase()}">
      ${order.status || "Placed"}
    </span>
  </div>

  <p><strong>Total:</strong> ₹${order.total}</p>

<p>
  <strong>Date:</strong>
  ${new Date(order.createdAt).toLocaleDateString("en-IN")}
</p>

  <div class="order-items">
    ${itemsHTML}
  </div>
`;
      container.appendChild(div);
    });

  } catch (err) {
    console.error("Orders error:", err);
    container.innerHTML = "<p>Failed to load orders</p>";
  }

});