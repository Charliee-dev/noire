const API = "https://noire-backend-6ikq.onrender.com";
const token = localStorage.getItem("token");

const qs = id => document.getElementById(id);

let editId = null;

// ================= AUTH =================
function checkAuth() {
  if (!token) return redirect();

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") return redirect();
  } catch {
    return redirect();
  }

  init();
}

function redirect() {
  window.location.href = "../index.html";
}

// ================= INIT =================
function init() {
  qs("loading").style.display = "none";
  qs("app").classList.remove("hidden");

  setupEvents();
  loadAll();
}

// ================= EVENTS =================
function setupEvents() {

  qs("logoutBtn").onclick = () => {
    localStorage.removeItem("token");
    redirect();
  };

  qs("image").addEventListener("input", e => {
    const img = qs("preview");
    if (!e.target.value) return img.style.display = "none";
    img.src = e.target.value;
    img.style.display = "block";
  });

  qs("submitBtn").onclick = submitProduct;

  qs("cancelEdit").onclick = resetForm;
}

// ================= API =================
async function api(url, options = {}) {
  const res = await fetch(API + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    }
  });

  if (!res.ok) throw new Error("API error");

  return res.json();
}

// ================= LOAD =================
function loadAll() {
  loadProducts();
  loadOrders();
  loadStats();
}

// ================= PRODUCTS =================
async function loadProducts() {
  const box = qs("products");
  box.innerHTML = "Loading...";

  try {
    const data = await api("/api/products");

    if (!data.data.length) {
      box.innerHTML = "No products";
      return;
    }

    box.innerHTML = data.data.map(p => `
      <div class="list-item">
        <span>${p.name}</span>
        <span>₹${p.price}</span>
        <div>
          <button onclick="editProduct('${p._id}','${p.name}',${p.price},'${p.image || ""}')">Edit</button>
          <button onclick="deleteProduct('${p._id}')">Delete</button>
        </div>
      </div>
    `).join("");

  } catch {
    box.innerHTML = "Error loading products";
  }
}

function editProduct(id, name, price, image) {
  editId = id;

  qs("name").value = name;
  qs("price").value = price;
  qs("image").value = image;

  qs("formTitle").innerText = "Edit Product";
  qs("submitBtn").innerText = "Update Product";
  qs("cancelEdit").classList.remove("hidden");
}

async function deleteProduct(id) {
  if (!confirm("Delete product?")) return;

  await api(`/api/admin/delete-product/${id}`, { method: "DELETE" });
  loadProducts();
}

// ================= ADD / UPDATE =================
async function submitProduct() {
  const name = qs("name").value.trim();
  const price = qs("price").value;
  const image = qs("image").value;

  if (!name || !price) {
    qs("message").innerText = "Fill all fields";
    return;
  }

  const url = editId 
    ? `/api/admin/update-product/${editId}` 
    : "/api/admin/add-product";

  const method = editId ? "PUT" : "POST";

  await api(url, {
    method,
    body: JSON.stringify({ name, price, image })
  });

  qs("message").innerText = editId ? "Updated" : "Added";

  resetForm();
  loadProducts();
}

function resetForm() {
  editId = null;

  qs("name").value = "";
  qs("price").value = "";
  qs("image").value = "";

  qs("formTitle").innerText = "Add Product";
  qs("submitBtn").innerText = "Add Product";
  qs("cancelEdit").classList.add("hidden");
}

// ================= ORDERS =================
async function loadOrders() {
  const box = qs("orders");

  try {
    const orders = await api("/api/order/admin")

    if (!orders.length) {
      box.innerHTML = "No orders";
      return;
    }

    box.innerHTML = orders.map(o => `
      <div class="list-item">
        <span>#${o._id.slice(-5)}</span>
        <span>₹${o.total}</span>
        <select onchange="updateStatus('${o._id}', this.value)">
          <option ${o.status==="Placed"?"selected":""}>Placed</option>
          <option ${o.status==="Shipped"?"selected":""}>Shipped</option>
          <option ${o.status==="Delivered"?"selected":""}>Delivered</option>
        </select>
      </div>
    `).join("");

  } catch {
    box.innerHTML = "Error loading orders";
  }
}

async function updateStatus(id, status) {
  await api(`/api/order/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });
}

// ================= STATS =================
async function loadStats() {
  const stats = qs("stats");

  const data = await api("/api/products");

  stats.innerHTML = `
    <div class="stat">Products: ${data.data.length}</div>
  `;
}


// ================= START =================
checkAuth();