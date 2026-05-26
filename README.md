# E-Commerce Platform (Flipkart/Amazon-style)

A full-stack, polyglot e-commerce starter built as a **microservices monorepo**.

## 🧱 Tech Stack

| Layer        | Tech                                      | Purpose                                      |
|--------------|-------------------------------------------|----------------------------------------------|
| Frontend     | **Next.js 14 (App Router) + React + TypeScript** | UI, SSR pages, client interactivity      |
| Auth/User API| **Node.js + Express + TypeScript**        | Auth, JWT, user profiles (REST)              |
| Catalog API  | **Node.js + Fastify + TypeScript**        | Products, Cart, Orders (high-throughput REST)|
| Payment API  | **Java 17 + Spring Boot**                 | Payment intents, verification, refunds       |
| SQL DB       | **PostgreSQL** via **Prisma**             | Users, sessions, orders (relational)         |
| NoSQL DB     | **MongoDB**                               | Products, carts, reviews (flexible schema)   |

## 📂 Project Structure

```
practice/
├── frontend/                  # Next.js + React + TS
├── backend/
│   ├── express-service/       # Auth + Users (Express + PostgreSQL/Prisma)
│   ├── fastify-service/       # Products + Cart + Orders (Fastify + MongoDB)
│   └── java-service/          # Payments (Spring Boot)
├── docker-compose.yml         # Postgres + MongoDB
├── init.sh                    # One-shot bootstrap script
├── README.md
└── ARCHITECTURE.md            # Deep-dive: code structure, data flow, every file explained
```

## 🚀 Quick Start

```bash
# 1. Bootstrap everything (installs deps, starts DBs)
./init.sh

# 2. Start every service together
./start-all.sh
```

If you want manual control, the services are still available individually via `npm run dev:frontend`, `npm run dev:express`, `npm run dev:fastify`, and `npm run dev:java`.

## ✨ Features Implemented

- 🔐 **Auth**: Signup, login, JWT-based sessions, protected routes
- 🏠 **Home page** with featured products carousel
- 📋 **PLP** (Product Listing) with filters/search
- 🔎 **PDP** (Product Detail Page) with reviews
- 🛒 **Cart**: add / remove / update qty (client + server sync)
- 💳 **Checkout & Payment**: address → payment intent → confirmation
- 📊 **User Dashboard**: orders, addresses, profile
- 👤 **Profile management**

### Easily Extendable

The structure supports adding: wishlist, recommendations, seller dashboard, admin panel, search (Elasticsearch), notifications (Kafka), image CDN, coupons, ratings/reviews, order tracking, returns.

## 🌐 Service URLs

| Service          | URL                       | Health                |
|------------------|---------------------------|-----------------------|
| Frontend         | http://localhost:3000     | /                     |
| Express (Auth)   | http://localhost:4001     | /health               |
| Fastify (Catalog)| http://localhost:4002     | /health               |
| Java (Payment)   | http://localhost:4003     | /actuator/health      |
| Postgres         | localhost:5432            |                       |
| MongoDB          | localhost:27017           |                       |

## 📚 Read Next

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Deep explanation of every file, data flow diagrams, and how each piece works together.

## 🛠 Requirements

- Node.js ≥ 18
- Java 17 + Maven (or use the bundled `./mvnw`)
- Docker + Docker Compose (for Postgres & MongoDB)

## 📝 License

MIT
