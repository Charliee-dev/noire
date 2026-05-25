import { request } from "./api.js";
import { checkAuth } from "./auth.js";
import { loadProducts, submitProduct } from "./products.js";
import { loadOrders } from "./orders.js";

const qs = id => document.getElementById(id);

if (!checkAuth()) {
  window.location.href = "../index.html";
}

init();

function init() {
  qs("loading").style.display = "none";
  qs("app").classList.remove("hidden");

  setup();
  loadProducts();
  loadOrders();
  loadStats(); // ✅ ADD THIS
}

function setup() {

  qs("logoutBtn").onclick = () => {
    localStorage.removeItem("token");
    location.reload();
  };

  qs("submitBtn").onclick = () => {
    submitProduct({
  name: qs("name").value,
  price: qs("price").value,
  image: qs("image").value,
  description: qs("description").value,
  stock: qs("stock").value
});
  };

  qs("image").addEventListener("input", e => {
    const img = qs("preview");
    img.src = e.target.value;
    img.style.display = e.target.value ? "block" : "none";
  });
}

async function loadStats() {

  try {

    const productsRes =
      await request("/api/products");

    const ordersRes =
      await request("/api/order/admin");

    const productCount =
      productsRes.data.length;

    const orderCount =
      ordersRes.length;

    const revenue =
  ordersRes
    .filter(order => order.paid)
    .reduce(
      (sum, order) => sum + order.total,
      0
    );

    document.getElementById("stats").innerHTML = `
      <div class="stat">
        <h3>${productCount}</h3>
        <p>Products</p>
      </div>

      <div class="stat">
        <h3>${orderCount}</h3>
        <p>Orders</p>
      </div>

      <div class="stat">
        <h3>₹${revenue.toLocaleString("en-IN")}</h3>
        <p>Revenue</p>
      </div>
    `;

  } catch (err) {
    console.error(err);
  }

}