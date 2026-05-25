import { request } from "./api.js";
import { renderList } from "./ui.js";

let editId = null;

export async function loadProducts() {
  const box = document.getElementById("products");

  try {
    const data = await request("/api/products");

    if (!data.data.length) {
      renderList(box, "No products");
      return;
    }

    renderList(box, data.data.map(p => `
      <div class="list-item">
        <span>${p.name}</span>
        <span>₹${p.price}</span>
        <div>
          <button data-edit="${p._id}">Edit</button>
          <button data-del="${p._id}">Delete</button>
        </div>
      </div>
    `).join(""));

    bindEvents();

  } catch {
    renderList(box, "Error loading");
  }
}

function bindEvents() {
  document.querySelectorAll("[data-del]").forEach(btn => {
    btn.onclick = () => deleteProduct(btn.dataset.del);
  });

  document.querySelectorAll("[data-edit]").forEach(btn => {
    btn.onclick = () => startEdit(btn.dataset.edit);
  });
}

async function deleteProduct(id) {
  if (!confirm("Delete?")) return;
  await request(`/api/admin/delete-product/${id}`, { method: "DELETE" });
  loadProducts();
}

async function startEdit(id) {

  try {

    const data = await request("/api/products");

    const product =
      data.data.find(p => p._id === id);

    if (!product) return;

    editId = id;

    document.getElementById("name").value =
      product.name;

    document.getElementById("price").value =
      product.price;

    document.getElementById("image").value =
      product.image;
document.getElementById("description").value =
  product.description || "";

document.getElementById("stock").value =
  product.stock || 0;
    const preview =
      document.getElementById("preview");

    preview.src = product.image;
    preview.style.display = "block";

  } catch (err) {
    console.error(err);
  }
}

export async function submitProduct(data) {
  const url = editId
    ? `/api/admin/update-product/${editId}`
    : "/api/admin/add-product";

  const method = editId ? "PUT" : "POST";

  await request(url, {
    method,
    body: JSON.stringify(data)
  });

  editId = null;
  loadProducts();
  document.getElementById("name").value = "";
document.getElementById("price").value = "";
document.getElementById("image").value = "";
document.getElementById("description").value = "";

document.getElementById("stock").value = "";

document.getElementById("preview").style.display =
  "none";
  document.getElementById("preview").src = "";
}