  document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("cart-items");
    const emptyText = document.getElementById("empty-cart");

    const orderValueEl = document.getElementById("order-value");
    const deliveryFeeEl = document.getElementById("delivery-fee");
    const finalTotalEl = document.getElementById("final-total");

    const checkoutBtn = document.getElementById("checkoutBtn");
    const cartLoginBtn =
document.getElementById("cartLoginBtn");

    const accountBtn = document.getElementById("accountBtn");
    const overlay = document.getElementById("overlay");
    const closeBtn = document.getElementById("closeBtn");
    

    let cart = [];
function showMessage(msg, color = "black") {

  const box = document.createElement("div");

  box.innerText = msg;

  box.style.position = "fixed";
  box.style.bottom = "20px";
  box.style.right = "20px";
  box.style.background = color;
  box.style.color = "white";
  box.style.padding = "10px 20px";
  box.style.borderRadius = "5px";
  box.style.zIndex = "9999";

  document.body.appendChild(box);

  setTimeout(() => box.remove(), 2000);
}

  function showLoginPopup() {
    const popup = document.getElementById("loginPopup");

    if (!popup) return;

    popup.classList.remove("hidden");
    popup.classList.add("show");

    setTimeout(() => {
      popup.classList.remove("show");
      popup.classList.add("hidden");
    }, 2000);
  }

  checkoutBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");




  if (!token) {
    showLoginPopup(); // 🔥 YOUR RED POPUP
    setTimeout(() => {
      overlay.classList.add("active"); // 🔥 opens login modal
    }, 1200);
    return;
  }

    try {
      // 🔥 STEP 1: CREATE RAZORPAY ORDER
      const res = await fetch("https://noire-backend-6ikq.onrender.com/api/payment/create-order", {
        method: "POST",
       headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + token
}
      });

      if (!res.ok) {
  throw new Error("Failed to create order");
}

const data = await res.json();

      // 🔥 STEP 2: OPEN PAYMENT POPUP
      const options = {
        key: "rzp_test_SllMAMbiVHvS2L", // 🔴 replace this
        amount: data.amount,
        currency: "INR",
        name: "NOIRE",
        description: "Order Payment",
        order_id: data.id,

        handler: async function (response) {

    // 🔐 STEP 1: VERIFY PAYMENT
    const verifyRes = await fetch("https://noire-backend-6ikq.onrender.com/api/payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
  razorpay_order_id: response.razorpay_order_id,
  razorpay_payment_id: response.razorpay_payment_id,
  razorpay_signature: response.razorpay_signature
})
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      showMessage("Payment successful!", "green");

setTimeout(() => {
  window.location.href = "orders.html";
}, 1200);
      return;
    }



    alert("Payment successful!");
    window.location.href = "orders.html";
  }
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", function (response) {
    showMessage("Payment failed. Please try again.", "red");
    console.error(response.error);
  });
      rzp.open();

    } catch (err) {
      console.error(err);
      showMessage("Payment failed", "red");
    }
  });
    // ===============================
    // 🔐 SAFE USER HANDLER
    // ===============================


    // ===============================
    // 💰 FORMAT PRICE
    // ===============================
    function formatPrice(value) {
      return "₹ " + value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    // ===============================
    // 🔥 LOAD CART (GUEST + USER)
    // ===============================
    async function loadCart() {
    const token = localStorage.getItem("token");

  if (!token) {
    container.innerHTML = `
  <p style="text-align:center">
    Please sign in to access your shopping bag
  </p>
`;
    emptyText.style.display = "none";
    return;
  }
    try {
      const res = await fetch("https://noire-backend-6ikq.onrender.com/api/cart", {
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      const data = await res.json();
      cart = data.items || [];
      renderCart();

    } catch (err) {
      console.error("Cart load error:", err);
      cart = [];
      renderCart();
    }
  }

    // ===============================
    // 🛒 RENDER CART
    // ===============================
    function renderCart() {

      if (cart.length === 0) {
        emptyText.style.display = "block";
        container.innerHTML = "";

        orderValueEl.innerText = formatPrice(0);
        deliveryFeeEl.innerText = formatPrice(0);
        finalTotalEl.innerText = formatPrice(0);

        checkoutBtn.style.display = "none";
        cartLoginBtn.style.display = "block";
        return;
      }

      emptyText.style.display = "none";
      container.innerHTML = "";

      let total = 0;

      cart.forEach((item, index) => {

        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const div = document.createElement("div");
        div.classList.add("cart-card");

        div.innerHTML = `
          <img src="${item.image}" alt="${item.name}">

          <div class="cart-info">
            <h3>${item.name}</h3>
            <p class="price">₹ ${item.price}</p>
            <p class="meta">SIZE : ${item.size}</p>

            <div class="quantity-box">
              <button onclick="changeQty('${item.productId}','${item.size}', -1)">−</button>
              <span>${item.qty}</span>
              <button onclick="changeQty('${item.productId}','${item.size}', 1)">+</button>
            </div>

            <div class="actions">
              <span onclick="removeItem('${item.productId}','${item.size}')">REMOVE</span>
            </div>
          </div>

          <div class="item-total">
            ${formatPrice(itemTotal)}
          </div>
        `;

        container.appendChild(div);
      });

      // ===============================
      // 🚚 DELIVERY LOGIC
      // ===============================
      let deliveryFee = total >= 10000 ? 0 : 149;
      const finalTotal = total + deliveryFee;

      orderValueEl.innerText = formatPrice(total);
      deliveryFeeEl.innerText = formatPrice(deliveryFee);
      finalTotalEl.innerText = formatPrice(finalTotal);

      // ===============================
      // 🔐 LOGIN / CHECKOUT BUTTON
      // ===============================
      const token = localStorage.getItem("token");

  if (token) {
        checkoutBtn.style.display = "block";
        cartLoginBtn.style.display = "none";
      } else {
        checkoutBtn.style.display = "none";
        cartLoginBtn.style.display = "block";
      }
    }

    // ===============================
    // ❌ REMOVE ITEM
    // ===============================
    window.removeItem = async function(productId, size) {
      

      await fetch("https://noire-backend-6ikq.onrender.com/api/cart/remove", {
        method: "DELETE",
        headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
  },
      body: JSON.stringify({
    productId,
    size
  })
      });

      loadCart();
    };

    // ===============================
    // 🔄 CHANGE QUANTITY
    // ===============================
    window.changeQty = async function(productId, size, change) {

      await fetch("https://noire-backend-6ikq.onrender.com/api/cart/update", {
        method: "PUT",
        headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
  },
      body: JSON.stringify({
    productId,
    size,
    change
  })
      });

      loadCart();
    };

    // ===============================
    // 🔐 LOGIN MODAL
    // ===============================
    function openModal() {
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      overlay.classList.remove("active");
      document.body.style.overflow = "auto";
    }

    if (accountBtn) {
  accountBtn.addEventListener("click", () => {

    const token =
      localStorage.getItem("token");

    if(token){
      window.location.href =
        "account.html";
    }else{
      openModal();
    }

  });
}
    const loginBtn =
document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener(
    "click",
    openModal
  );
}
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // ===============================
    // 🔥 LOGIN + MERGE CART
    // ===============================
  
    // ===============================
    // 🚀 INITIAL LOAD
    // ===============================
    loadCart();

  });