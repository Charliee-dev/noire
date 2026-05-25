    let currentVariant = null;
    const API_BASE = "http://localhost:5001";
    console.log("JS WORKING");

    // ===============================
    // 🔐 SAFE USER HANDLER
    // ===============================

    document.addEventListener("DOMContentLoaded", () => {

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

      let allProducts = [];

      const wishlistBtn = document.getElementById("wishlistBtn");
      const cartBtn = document.getElementById("cartBtn");
      const accountBtn = document.getElementById("accountBtn");
      const overlay = document.getElementById("overlay");
      const closeBtn = document.getElementById("closeBtn");
      const cartLoginBtn = document.getElementById("cartLoginBtn");

      const searchBtn = document.getElementById("searchBtn");
      const searchOverlay = document.getElementById("searchOverlay");
      const searchInput = document.getElementById("searchInput");
      const searchResults = document.getElementById("searchResults");
      const cartSlide = document.getElementById("cart-slide");
      const loginBtn = document.getElementById("loginBtn");


      if (cartLoginBtn) {
  cartLoginBtn.addEventListener("click", () => {
    document.getElementById("overlay")?.classList.add("active");
  });
}
      // ===============================
      // 🔍 SEARCH OVERLAY
      // ===============================
      if (searchBtn && searchOverlay) {
        searchBtn.addEventListener("click", () => {
          searchOverlay.classList.add("active");
          document.body.style.overflow = "hidden";
        });

        searchOverlay.addEventListener("click", (e) => {
          if (e.target === searchOverlay) {
            searchOverlay.classList.remove("active");
            document.body.style.overflow = "auto";
          }
        });

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            searchOverlay.classList.remove("active");
            document.body.style.overflow = "auto";
          }
        });
      }

      // ===============================
      // 🛒 CART REDIRECT
      // ===============================
      if (cartBtn) {
        cartBtn.addEventListener("click", () => {
          window.location.href = "cart.html";
        });
      }

      // ===============================
      // 🔥 BACKEND CART COUNT (GUEST SUPPORT)
      // ===============================
async function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;

  try {
    const token = localStorage.getItem("token");

    // ✅ If not logged in → just show 0 (no message)
    if (!token) {
      el.innerText = 0;
      return;
    }

    const res = await fetch(`${API_BASE}/api/cart`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

const json = await res.json();

if (!json.items) {
  console.error("Invalid API response:", json);
  return;
}

const cart = json.items;

    
    const count = cart.reduce((t, i) => t + i.qty, 0);

    el.innerText = count;

  } catch (err) {
    console.error("Cart count error:", err);
    el.innerText = 0;
  }
}
      updateCartCount();
      

      // ===============================
      // 🛒 ADD BUTTON (BACKEND + GUEST)
      // ===============================
      document.addEventListener("click", async (e) => {

        const btn = e.target.closest(".add-btn");
if (!btn) return;

btn.innerText = "Adding...";
btn.disabled = true;

        const token = localStorage.getItem("token");

if (!token) {
  showMessage("Please login first", "red");

  btn.innerText = "Add to Cart";
  btn.disabled = false;

  return;
}

        const selectedSize = document.querySelector(".size.active");

       if (!selectedSize) {
  const error = document.getElementById("size-error");
  if (error) {
    error.innerText = "Please select a size";
    error.classList.add("show");
  }

  btn.innerText = "Add to Cart";
  btn.disabled = false;

  return;
}



        const name = document.getElementById("productTitle")?.innerText;
        const priceText = document.getElementById("productPrice")?.innerText;
        const img = currentVariant?.images[0];
        const color = currentVariant?.color;
        const size = selectedSize.innerText;

        const params = new URLSearchParams(window.location.search);
        const productId = params.get("id");

        const price = parseFloat(priceText.replace(/[₹,]/g, ""));

    try {
  const res = await fetch(`${API_BASE}/api/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
body: JSON.stringify({
  product: {
    productId,
    name,
    price,
    image: img,
    color,        // ✅ ADD THIS
    size,
    qty: 1
  }
})
  });

  const data = await res.json();

  if (data.success) {
    updateCartCount();

    btn.innerText = "Add to Cart";
    btn.disabled = false;

   // showMessage("Added to cart", "green");

    // ✅ MOVE CART SLIDE HERE
    document.getElementById("cart-img").src = img;
    document.getElementById("cart-name").innerText = name;
    document.getElementById("cart-price").innerText = priceText;
    document.getElementById("cart-size").innerText = "Size: " + size + " | " + color;

    if (cartSlide) {
      cartSlide.classList.add("active");
      setTimeout(() => cartSlide.classList.remove("active"), 2000);
    }

  } else {
    throw new Error("Add to cart failed");
  }

} catch (err) {
  console.error("Cart error:", err);

  btn.innerText = "Add to Cart";
  btn.disabled = false;

  showMessage("Something went wrong", "red");
}
});

      // ===============================
      // 🔹 MODAL
      // ===============================
      function openModal() {
        if (!overlay) return;
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
      }

      function closeModal() {
        if (!overlay) return;
        overlay.classList.remove("active");
        document.body.style.overflow = "auto";
      }

if (accountBtn) {
  accountBtn.addEventListener("click", () => {
    const token = localStorage.getItem("token");

    if (token) {
      window.location.href = "account.html";
    } else {
      document.getElementById("overlay")?.classList.add("active");
    }
  });
}
      if (closeBtn) closeBtn.addEventListener("click", closeModal);

      // ===============================
      // 🔹 FETCH PRODUCTS
      // ===============================
      (async () => {
       try {
  const container = document.getElementById("product-list");

  if (container) {
    container.innerHTML = "<p>Loading products...</p>";
  }

  const res = await fetch(`${API_BASE}/api/products`);
const json = await res.json();

const products = json.data;   // ✅ FIX
allProducts = products;       // ✅ FIX

  if (!container) {
    console.error("❌ product-list container missing");
    return;
  }

  container.innerHTML = "";

 products.forEach(product => {

  let img = "images/fallback.png";

  // ✅ If variants exist → use first image
  if (product.variants && product.variants.length > 0) {
    img = product.variants[0]?.images?.[0] || img;
  }

  // ✅ If no variants → use direct image
  else if (product.image) {
    img = product.image;
  }

  const box = document.createElement("div");
  box.classList.add("box");

  box.innerHTML = `
    <img src="${img}">
    <p>${product.name}</p>
    <p>₹ ${Number(product.price).toLocaleString("en-IN")}</p>
  `;

  box.onclick = () => {
    window.location.href = `product.html?id=${product._id}`;
  };

  container.appendChild(box);
});

} catch (err) {
  console.error("❌ API ERROR:", err);

  if (container) {
    container.innerHTML =
      "<p>Unable to load products. Please refresh.</p>";
  }
}
})();
      // ===============================
      // 🔹 SEARCH
      // ===============================
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          const query = searchInput.value.toLowerCase();
          searchResults.innerHTML = "";

          if (!query) return;

          const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(query)
          );

          if (filtered.length === 0) {
            searchResults.innerHTML = `
              <div class="no-results">No products found</div>
            `;
            return;
          }

filtered.forEach(product => {

  const item = document.createElement("div");
  item.classList.add("search-item");

  const img =
    product.variants?.[0]?.images?.[0] ||
    product.image ||
    "images/fallback.png";

  item.innerHTML = `
    <img src="${img}">
    <span>${product.name}</span>
  `;

  // ✅ THIS MUST BE HERE (inside loop)
  const imageEl = item.querySelector("img");
  imageEl.onerror = () => {
    imageEl.src = "images/fallback.png";
  };

  item.onclick = () => {
    window.location.href = `product.html?id=${product._id}`;
  };

  searchResults.appendChild(item);
});
        });
      }


const signupBtn = document.getElementById("signupBtn");

const resetPasswordBtn =
document.getElementById("resetPasswordBtn");

if (resetPasswordBtn) {

  resetPasswordBtn.addEventListener(
    "click",
    async () => {

      const email =
        document.getElementById("resetEmail").value;

      const newPassword =
        document.getElementById("resetNewPassword").value;

      const confirmPassword =
        document.getElementById("resetConfirmPassword").value;

      if (!email || !newPassword || !confirmPassword) {
        showMessage("Fill all fields", "red");
        return;
      }

      if (newPassword !== confirmPassword) {
        showMessage("Passwords do not match", "red");
        return;
      }

      showMessage(
        "Frontend Ready",
        "green"
      );

    }
  );

}

const forgotPasswordLink =
document.getElementById("forgotPasswordLink");

const resetSection =
document.getElementById("resetSection");

if (forgotPasswordLink && resetSection) {

  forgotPasswordLink.addEventListener("click", () => {

    if (resetSection.style.display === "none") {
      resetSection.style.display = "block";
    } else {
      resetSection.style.display = "none";
    }

  });

}

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      showMessage("Fill all fields", "red");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        showMessage("Account created! Now login.", "green");
          document.getElementById("overlay").classList.remove("active");

      } else {
        showMessage(data.message || "Signup failed", "red");
      }

    } catch (err) {
      console.error(err);
      showMessage("Server error", "red");
    }

  });
}
      // ===============================
      // 🔹 USER UI
      // ===============================
function checkUser() {

  const token = localStorage.getItem("token");

  if (!accountBtn) return;

  if(token){

    accountBtn.src = "images/icons/profile-icon.png";

    accountBtn.classList.add("logged-in");

  }else{

    accountBtn.src = "images/icons/profile.svg";

    accountBtn.classList.remove("logged-in");

  }

}


      checkUser();

      // ===============================
      // 🔹 LOAD PRODUCT PAGE
      // ===============================
      const params = new URLSearchParams(window.location.search);
      const productId = params.get("id");

const title = document.getElementById("productTitle");
if (title) title.innerText = "Loading Product...";
      async function loadProduct() {
        if (!productId) return;

        try {
          const res = await fetch(`${API_BASE}/api/products/${productId}`);
const json = await res.json();

if (!json.success) {
  console.error("Product error");
  return;
}

const product = json.product;  // ✅ FIX
loadRelatedProducts(product._id);
          const title = document.getElementById("productTitle");
          const price = document.getElementById("productPrice");
          const image = document.getElementById("mainImage");


          const colorText = document.getElementById("colorText");
          const colorContainer = document.getElementById("colorContainer");


          if (title) title.innerText = product.name;

          if (price) {
            price.innerText = "₹ " + Number(product.price).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          }
          
const description =
document.getElementById("productDescription");

if (description) {
  description.innerText =
    product.description ||
    "No description available";
}

const stock =
document.getElementById("productStock");

if (stock) {

  if (product.stock > 10) {
    stock.innerText = "✓ In Stock";
  }

  else if (product.stock > 0) {
    stock.innerText =
      `Only ${product.stock} left`;
  }

  else {
    stock.innerText =
      "Out Of Stock";
  }

}
          

         if (product.variants && product.variants.length > 0) {

  // ✅ safe first variant
  currentVariant = product.variants[0];

  if (currentVariant.images && currentVariant.images.length > 0) {
    image.src = currentVariant.images[0];
  } 
  
  else {
    image.src = "images/fallback.png"; // optional fallback
  }

  if (colorText) {
    colorText.innerText = "COLOUR: " + (currentVariant.color || "N/A");
  }

  colorContainer.innerHTML = "";

  product.variants.forEach((variant, index) => {

    // ❌ skip broken variant
    if (!variant.images || variant.images.length === 0) return;

    const btn = document.createElement("div");
    btn.classList.add("variant-box");

    if (index === 0) btn.classList.add("active");

    const img = document.createElement("img");
    img.src = variant.images[0];

    btn.appendChild(img);

    btn.addEventListener("click", () => {

      document.querySelectorAll(".variant-box")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      currentVariant = variant;

      image.src = variant.images[0];

      if (colorText) {
        colorText.innerText = "COLOUR: " + (variant.color || "N/A");
      }
    });

    colorContainer.appendChild(btn);
  });

}

        } catch (err) {
          console.error("Product load error:", err);
        }
      }

      loadProduct();

if (wishlistBtn) {

  wishlistBtn.addEventListener(
    "click",
    async () => {

      const token =
        localStorage.getItem("token");

      if (!token) {
        showMessage(
          "Please login first",
          "red"
        );
        return;
      }

      if (!productId) return;

      try {

        const res = await fetch(
          `${API_BASE}/api/products/${productId}`
        );

        const json = await res.json();

        const product = json.product;

        const addRes = await fetch(
          `${API_BASE}/api/wishlist/add`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              "Authorization":
                "Bearer " + token
            },
            body: JSON.stringify({
              productId: product._id,
              name: product.name,
              price: product.price,
              image:
                product.variants?.[0]?.images?.[0]
                || product.image
            })
          }
        );

        const data =
          await addRes.json();

        if (data.success) {

          showMessage(
            "Added to Wishlist ❤️",
            "green"
          );

        }

      } catch (err) {

        console.error(err);

        showMessage(
          "Wishlist error",
          "red"
        );

      }

    }
  );

}
      // ===============================
      // 📏 SIZE SELECT
      // ===============================
      const sizes = document.querySelectorAll(".size");

      sizes.forEach(btn => {
        btn.addEventListener("click", () => {
          sizes.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });

      document.addEventListener("click", async (e) => {

  if (!e.target.closest("#loginBtn")) return;


  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;


  if (!email || !password) {
    showMessage("Enter email & password", "red");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
  localStorage.setItem("token", data.token);

  showMessage("Login successful", "green");

  document.getElementById("overlay")?.classList.remove("active");

  checkUser();
  updateCartCount();

  location.reload(); // 🔥 THIS FIXES CART PAGE LOGIN ISSUE
}else {
      showMessage("Invalid credentials", "red");
    }

  } catch (err) {
    console.error(err);
    showMessage("Server error", "red");
  }

});


async function placeOrder() {
  const token = localStorage.getItem("token");

  if (!token) {
    showMessage("Please login first", "red");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/order/place`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        address: {
          name: "Test User",
          phone: "9999999999",
          address: "Demo Address",
          city: "Guwahati",
          postalCode: "781001"
        }
      })
    });

    const data = await res.json();

    if (data.success) {
      showMessage("Order placed successfully!", "green");
      window.location.href = "orders.html"; // optional
    } else {
      showMessage("Order failed", "red");
    }

  } catch (err) {
    console.error(err);
    showMessage("Server error", "red");
  }
}

// ===============================
// 🔘 CONNECT PLACE ORDER BUTTON
// ===============================
const placeBtn = document.getElementById("placeOrderBtn");

if (placeBtn) {
  placeBtn.addEventListener("click", placeOrder);
}



});

async function loadRelatedProducts(currentId){

  try{

    const res = await fetch(
      `${API_BASE}/api/products`
    );

    const json = await res.json();

    const products = json.data;

    const grid =
    document.getElementById("relatedGrid");

    if(!grid) return;

    grid.innerHTML = "";

    products
      .filter(p => p._id !== currentId)
      .slice(0,8)
      .forEach(product => {

        const img =
          product.variants?.[0]?.images?.[0]
          || product.image
          || "images/fallback.png";

        const card =
        document.createElement("div");

        card.classList.add("related-card");

        card.innerHTML = `
          <img src="${img}">
          <h4>${product.name}</h4>
          <p>₹ ${Number(product.price).toLocaleString("en-IN")}</p>
        `;

       card.onclick = () => {
  window.location.href = `product.html?id=${product._id}`;
};

        grid.appendChild(card);

      });

  }catch(err){
    console.error(err);
  }

}

document.addEventListener("DOMContentLoaded",()=>{

  const carousel =
  document.getElementById("relatedGrid");

  const left =
  document.querySelector(".related-arrow.left");

  const right =
  document.querySelector(".related-arrow.right");

  if(left){

    left.addEventListener("click",()=>{

      carousel.scrollBy({
        left:-320,
        behavior:"smooth"
      });

    });

  }

  if(right){

    right.addEventListener("click",()=>{

      carousel.scrollBy({
        left:320,
        behavior:"smooth"
      });

    });

  }

});