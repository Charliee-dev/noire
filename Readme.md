# 🛍️ NOIRE – Full Stack E-Commerce Website

A full-stack e-commerce web application with authentication, cart, orders, and admin dashboard.

## 🚀 Features

### 👤 User
- Sign up & login (JWT authentication)
- Browse products
- Add to cart (size + quantity)
- View cart & checkout
- Place orders
- View order history

### 🛒 Cart System
- Add / update / remove items
- Persistent cart (MongoDB)
- Live cart count in navbar

### 📦 Orders
- Create order from cart
- Delivery fee logic
- Order history with timestamps

### 🔐 Admin Panel
- Admin login (role-based)
- Add / update / delete products
- View all orders
- Update order status
- Search + pagination + filters

---

## 🧱 Tech Stack

**Frontend**
- HTML, CSS, JavaScript (Vanilla)

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB (Mongoose)

**Auth**
- JWT (JSON Web Tokens)
- bcrypt (password hashing)

---

## ⚙️ Installation

### 1. Clone repo
```bash
git clone https://github.com/your-username/noire-ecommerce.git
cd noire-ecommerce