const API_BASE = "http://127.0.0.1:5001";

document.addEventListener("DOMContentLoaded", async () => {

  const box = document.getElementById("wishlistItems");

  const token = localStorage.getItem("token");

  if (!token) {
    box.innerHTML = "<p>Please login first</p>";
    return;
  }

  try {

    const res = await fetch(
      `${API_BASE}/api/wishlist`,
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      box.innerHTML = "<p>Your wishlist is empty</p>";
      return;
    }

    box.innerHTML = "";

    data.items.forEach(item => {

      const div = document.createElement("div");

      div.classList.add("wishlist-card");

      div.innerHTML = `
        <img src="${item.image}">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>

        <button
          class="remove-btn"
          data-id="${item.productId}">
          Remove
        </button>
      `;

      // Open product page
      div.addEventListener("click", () => {
        window.location.href =
          `product.html?id=${item.productId}`;
      });

      box.appendChild(div);

    });

    // Remove buttons
    document
      .querySelectorAll(".remove-btn")
      .forEach(btn => {

        btn.addEventListener(
          "click",
          async (e) => {

            e.stopPropagation();

            try {

              await fetch(
                `${API_BASE}/api/wishlist/remove`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type":
                      "application/json",

                    "Authorization":
                      "Bearer " + token
                  },

                  body: JSON.stringify({
                    productId:
                      btn.dataset.id
                  })
                }
              );

              location.reload();

            } catch (err) {
              console.error(err);
            }

          }
        );

      });

  } catch (err) {

    console.error(err);

    box.innerHTML =
      "<p>Failed to load wishlist</p>";

  }

});