<div align="center">

# StockPulse

### E-Commerce & Real-Time Inventory Management Platform

A backend-focused, full-stack commerce platform with secure role-based access, atomic inventory control, analytics pipelines, and live WebSocket notifications.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?logo=socket.io&logoColor=white)
![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20RBAC-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Made by [Pawan Chauhan](https://github.com/)**

</div>

---

## Overview

**StockPulse** is an e-commerce and live inventory management system built with **Node.js**, **Express.js**, **MongoDB**, **Mongoose**, and **Socket.IO**. It follows a strict **MVC architecture** and implements:

- Secure JWT authentication with access and refresh tokens
- Role-Based Access Control (Customer, Seller, Admin)
- Atomic inventory updates that prevent overselling
- MongoDB aggregation pipelines for analytics
- Event-driven design using Node's `EventEmitter`
- Real-time browser notifications over WebSockets

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Seeding & Demo Credentials](#database-seeding--demo-credentials)
- [REST API Documentation](#rest-api-documentation)
- [Real-Time Events](#real-time-events)
- [Database Design & Indexes](#database-design--indexes)
- [Testing & Verification](#testing--verification)
- [Security Notes](#security-notes)
- [Future Enhancements](#future-enhancements)
- [Author](#author)
- [License](#license)

---

## Features

### Authentication & Authorization
- Secure registration and login with `bcryptjs` password hashing
- Dual-token flow (**JWT access token** + **refresh token**) with token invalidation on logout
- Three roles (**Customer**, **Seller**, **Admin**) enforced by backend middleware, with role-specific UI routing

### Product & Category Management
- Full CRUD for products and categories
- Full-text search, category and price-range filtering, sorting, and pagination
- Ownership validation so sellers can only modify or restock their own listings

### Shopping Cart & Atomic Checkout
- Server-side cart totals in **Indian Rupees (₹)** to prevent client-side price tampering
- Atomic stock deduction (`$inc` with a `$gte` filter) and automatic rollback to prevent overselling or negative stock under concurrent orders
- Order cancellation that automatically restores inventory

### Real-Time Alerts & Event-Driven Design
- Decoupled domain events (`orderPlaced`, `stockLow`, `orderStatusUpdated`) via Node.js `EventEmitter`
- Live toast notifications through **Socket.IO** for new orders, status changes, and low-stock alerts

### Analytics & Reporting
- Aggregation pipelines for product-wise sales revenue and category-wise inventory valuation

---

## Architecture

```text
Client (Web Frontend / Postman)
   | HTTP                                          | WebSocket
   v                                               v
Express: cors > express.json > morgan           Socket.IO (Real-time Server)
   |                                               ^
   v                                               |
Routes > protect (JWT) > authorize (RBAC) > validateRequired
   |                                               |
   v                                               |
Controllers --- appEvents.emit(...) ---> appEvents.js
   |
   v
Mongoose Models (User, Category, Product, Cart, Order)
   |
   v
MongoDB
```

Controllers validate business rules, mutate data, and emit a domain event. Side effects such as WebSocket notifications and server-side logging run decoupled inside `src/events/appEvents.js`, keeping HTTP responses fast and real-time transport logic cleanly separated.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime & Server** | Node.js, Express.js (`http.createServer` shared by Express and Socket.IO) |
| **Architecture** | Strict MVC (`models/`, `controllers/`, `routes/`, `middlewares/`, `events/`) |
| **Database & ODM** | MongoDB, Mongoose (schemas, validators, references, indexes, aggregations) |
| **Security & Auth** | `bcryptjs`, `jsonwebtoken` (access + refresh tokens), `dotenv`, RBAC |
| **Real-Time & Events** | Node.js core `events` (`EventEmitter`), `socket.io` |
| **Logging & Utilities** | `morgan`, `cors` |
| **Frontend Client** | Vanilla HTML5, CSS3, JavaScript (served statically from `/public`) |

---

## Project Structure

```text
stockpulse/
├── public/
│   └── index.html                # Role-routed storefront & admin/seller dashboard
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js     # Register, login, token refresh, logout, profile
│   │   ├── productController.js  # Product & category CRUD, search, pagination
│   │   ├── cartController.js     # Customer cart & server-side totals
│   │   ├── orderController.js    # Atomic checkout, rollback, order lifecycle
│   │   └── reportController.js   # Aggregation pipelines for analytics
│   ├── events/
│   │   └── appEvents.js          # EventEmitter bridge to Socket.IO broadcasts
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT verification (protect) & RBAC (authorize)
│   │   ├── errorMiddleware.js    # Centralized 404 & Mongoose error handler
│   │   └── validateMiddleware.js # Request payload validation
│   ├── models/
│   │   ├── User.js               # User schema, password hooks, role enum
│   │   ├── Category.js           # Product category schema
│   │   ├── Product.js            # Product schema with text & compound indexes
│   │   ├── Cart.js               # Customer cart schema
│   │   └── Order.js              # Order schema with price snapshots & indexes
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── reportRoutes.js
│   └── seed.js                   # Database seed script with sample data
├── .env.example                  # Environment variable template
├── .gitignore
├── package.json
└── server.js                     # Application entry point
```

---

## Prerequisites

- **Node.js** v18.0 or higher
- **npm** v9.0 or higher
- **MongoDB** (local Community Server on port `27017`, or a MongoDB Atlas URI)

---

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/stockpulse.git
   cd stockpulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `MONGO_URI` and the JWT secrets in `.env` as needed. Never commit `.env` to Git.

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Production
   npm start

   # Development (with nodemon)
   npm run dev
   ```

6. **Open the application** at **http://localhost:5000/**

---

## Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | HTTP server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/stockpulse` |
| `JWT_ACCESS_SECRET` | Secret for signing short-lived access tokens | `your_access_secret` |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | `your_refresh_secret` |
| `JWT_ACCESS_EXPIRES` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh token lifetime | `7d` |
| `LOW_STOCK_THRESHOLD` | Stock level that triggers real-time alerts | `5` |

> Use long, random values for the JWT secrets in any non-local environment.

---

## Database Seeding & Demo Credentials

`npm run seed` populates the database with 4 categories, 12 tech products (priced in ₹), 2 historical orders, and 3 user accounts:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@store.com` | `password123` | Full inventory, categories, all orders, analytics |
| **Seller** | `seller@store.com` | `password123` | Own products, restocking, assigned orders, analytics |
| **Customer** | `customer@store.com` | `password123` | Storefront, cart, checkout, order history |

> These credentials are for local demo use only. Change or remove them before deploying.

---

## REST API Documentation

All protected endpoints require the header: `Authorization: Bearer <accessToken>`

### Authentication & Profile (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new `customer` or `seller` account |
| `POST` | `/api/auth/login` | Public | Authenticate and return access & refresh tokens |
| `POST` | `/api/auth/refresh` | Public | Issue a new access/refresh token pair |
| `POST` | `/api/auth/logout` | Protected | Invalidate the stored refresh token |
| `GET` | `/api/auth/me` | Protected | Get the current user's profile |
| `PATCH` | `/api/auth/me` | Protected | Update display name |

### Products & Categories (`/api/products`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products/categories` | Public | List all categories |
| `POST` | `/api/products/categories` | Admin | Create a category |
| `GET` | `/api/products` | Public | List products (`?search=`, `?category=`, `?minPrice=`, `?maxPrice=`, `?sort=`, `?page=`, `?limit=`) |
| `GET` | `/api/products/:id` | Public | Get a single product |
| `POST` | `/api/products` | Seller, Admin | Create a product listing |
| `PATCH` | `/api/products/:id` | Seller (Owner), Admin | Update details or restock |
| `DELETE` | `/api/products/:id` | Seller (Owner), Admin | Delete a listing |

### Shopping Cart (`/api/cart`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Customer | Get cart with server-calculated INR total |
| `POST` | `/api/cart` | Customer | Add item or increment quantity (`{ productId, quantity }`) |
| `DELETE` | `/api/cart/:productId` | Customer | Remove an item |

### Orders (`/api/orders`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Customer | Validate cart, atomically deduct stock, create order |
| `GET` | `/api/orders/my` | Customer | Logged-in customer's order history |
| `GET` | `/api/orders` | Seller, Admin | All orders (filtered by ownership for sellers) |
| `PATCH` | `/api/orders/:id/status` | Customer (Cancel), Seller, Admin | Update status (`Confirmed`, `Shipped`, `Delivered`, `Cancelled`) |

### Analytics Reports (`/api/reports`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/sales` | Seller, Admin | Units sold, order count, and revenue per product |
| `GET` | `/api/reports/inventory` | Seller, Admin | Stock units, low-stock count, and valuation per category |

---

## Real-Time Events

| Domain Event (`EventEmitter`) | Socket.IO Event | Trigger |
| :--- | :--- | :--- |
| `orderPlaced` | `orderNotification` | A customer completes checkout; broadcasts order ID, status, and total |
| `stockLow` | `lowStockAlert` | Post-order stock drops to or below `LOW_STOCK_THRESHOLD` (default `5`) |
| `orderStatusUpdated` | `orderNotification` | A seller/admin advances an order, or a customer cancels a pending order |

---

## Database Design & Indexes

**Collections:** `users`, `categories`, `products`, `carts`, `orders`

| Model | Index | Purpose |
| :--- | :--- | :--- |
| `User` | Unique on `email` | Prevent duplicate accounts |
| `Category` | Unique on `name` | Prevent duplicate categories |
| `Product` | Text on `{ name, description }` | Keyword search |
| `Product` | Compound `{ category: 1, price: 1 }` | Filtered catalog sorting |
| `Order` | Compound `{ customer: 1, createdAt: -1 }` | Fast order-history queries |

---

## Testing & Verification

Verify the API with **Postman** or the built-in web client at `http://localhost:5000/`.

| Status | Scenario |
| :--- | :--- |
| **200 / 201** | Register/login, browse products, add to cart, place order, view reports |
| **400** | Checkout with an empty cart, missing `shippingAddress`, or quantity exceeding stock |
| **401** | Access `/api/cart` or `/api/orders` without a valid Bearer token |
| **403** | `POST /api/products` or `GET /api/reports/sales` with a customer token |
| **404** | Request a non-existent route or invalid resource ID |

---

## Security Notes

- Passwords are hashed with `bcryptjs` before storage
- Cart and order totals are computed server-side only
- Stock updates use atomic MongoDB operations to remain safe under concurrent checkouts
- Keep `.env` out of version control and rotate secrets for production

---

## Future Enhancements

- Payment gateway integration (e.g., Razorpay)
- Automated test suite (Jest + Supertest)
- Rate limiting and request sanitization
- Docker and CI/CD setup
- Email notifications for order updates

---

## Author

**Pawan Chauhan**

Designed and developed by Pawan Chauhan.

---


<div align="center">

Made with  by **Pawan Chauhan**

</div>
