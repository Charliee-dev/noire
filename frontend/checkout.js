document.addEventListener("DOMContentLoaded", () => {

  const summaryContainer = document.getElementById("summary-items");

  const orderValueEl = document.getElementById("order-value");
  const deliveryFeeEl = document.getElementById("delivery-fee");
  const finalTotalEl = document.getElementById("final-total");

  const placeOrderBtn = document.getElementById("placeOrderBtn");


  function formatPrice(value) {
    return "₹ " + value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  let cart = [];

  // ===============================
  // 🔥 LOAD CART
  // ===============================
  async function loadCart() {
  const token = localStorage.getItem("token");

  if (!token) {
    cart = [];
    renderSummary();
    return;
  }

  try {
    const res = await fetch("https://noire-backend-6ikq.onrender.com/api/cart", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();   // ✅ IMPORTANT
    cart = data.items || [];
    renderSummary();

  } catch (err) {
    console.error("Cart load error:", err);
    cart = [];
    renderSummary();
  }
}
  // ===============================
  // 🛒 RENDER SUMMARY
  // ===============================
  function renderSummary() {
    summaryContainer.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

      const itemTotal = item.price * item.qty;
      total += itemTotal;

      const div = document.createElement("div");

      div.innerHTML = `
        <p>${item.name} x ${item.qty}</p>
        <span>${formatPrice(itemTotal)}</span>
      `;

      summaryContainer.appendChild(div);
    });

    let delivery = total >= 10000 ? 0 : 149;
    let finalTotal = total + delivery;

    orderValueEl.innerText = formatPrice(total);
    deliveryFeeEl.innerText = formatPrice(delivery);
    finalTotalEl.innerText = formatPrice(finalTotal);
  }

  // ===============================
  // 🚀 PLACE ORDER (REAL BACKEND)
  // ===============================
  placeOrderBtn.addEventListener("click", async () => {

   const token = localStorage.getItem("token");

if (!token) {
      document.body.innerHTML = "<h2>Please login to continue</h2>";
      return;
    }

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const pincode = document.getElementById("pincode").value;

    if (!name || !phone || !address || !city || !pincode) {
      alert("Please fill all details");
      return;
    }

    try {
      const res = await fetch("https://noire-backend-6ikq.onrender.com/api/order/place", {
        method: "POST",
       headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + token
},
        body: JSON.stringify({
          address: {
            name,
            phone,
            address,
            city,
            pincode
          }
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Order placed successfully!");

        // 🔥 REDIRECT AFTER ORDER
        window.location.href = "index.html";
      } else {
        alert("Order failed. Try again.");
      }

    } catch (err) {
      console.error("Order error:", err);
      alert("Something went wrong");
    }

  });

  // ===============================
  // INITIAL LOAD
  // ===============================
  loadCart();

});