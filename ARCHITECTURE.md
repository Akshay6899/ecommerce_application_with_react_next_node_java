# 🏛️ Architecture & Code Walkthrough

This document explains **every file**, the **data flow**, and the **functionality** of each piece of the codebase.

---

## 1. High-Level Architecture

```
                    ┌──────────────────────────────┐
                    │   Browser (User)             │
                    └──────────────┬───────────────┘
                                   │ HTTPS
                    ┌──────────────▼───────────────┐
                    │   Next.js Frontend (3000)    │
                    │   - SSR pages                │
                    │   - React Client Components  │
                    │   - CartContext (state)      │
                    └──┬──────────┬──────────┬─────┘
                       │          │          │
              REST/JSON│   REST   │   REST   │
                       │          │          │
        ┌──────────────▼──┐  ┌────▼──────┐  ┌▼──────────────┐
        │ Express :4001   │  │ Fastify   │  │ Spring Boot   │
        │ Auth / Users    │  │ :4002     │  │ :4003 Payment │
        │                 │  │ Products  │  │               │
        │                 │  │ Cart      │  │               │
        │                 │  │ Orders    │  │               │
        └────────┬────────┘  └─────┬─────┘  └───────┬───────┘
                 │                 │                │
            ┌────▼─────┐      ┌────▼─────┐     ┌────▼─────┐
            │ Postgres │      │ MongoDB  │     │ Postgres │
            │ (Prisma) │      │          │     │ (orders) │
            └──────────┘      └──────────┘     └──────────┘
```

**Why this split?**
- **Express** → mature, gigantic middleware ecosystem → ideal for auth (passport, bcrypt, JWT).
- **Fastify** → 2-3x faster than Express → ideal for hot endpoints (product browsing).
- **Java/Spring Boot** → strict type system & enterprise integrations → ideal for payment (PCI compliance, idempotency).
- **Postgres** → relational integrity for users, orders, payments.
- **MongoDB** → flexible product schema (variable attributes per category).

---

## 2. Data Flow Examples

### 🔐 Signup / Login
```
Browser → POST /api/auth/signup
       → Next.js route handler → fetch → Express :4001 /auth/signup
                                       → bcrypt hash → Prisma → Postgres (users)
                                       ← JWT token
       ← cookie set
```

### 🛒 Add to Cart
```
Browser (CartContext) → POST Fastify /cart/:userId/items
                      → MongoDB carts collection upsert
                      ← updated cart returned
```

### 💳 Place Order + Pay
```
Browser → POST Fastify /orders            (creates pending order in Mongo)
       → POST Java /payments/intent      (creates payment intent in Postgres)
       → (Stripe/Razorpay redirect simulated)
       → POST Java /payments/verify       (marks paid)
       → PATCH Fastify /orders/:id/paid   (updates order status)
       → Redirect /dashboard/orders
```

---

## 3. Frontend — `frontend/`

Next.js 14 **App Router** with TypeScript.

| File | Purpose |
|------|---------|
| `next.config.js` | Disables image opt for demo, enables proxy headers. |
| `tsconfig.json` | TS config (strict mode, path alias `@/*`). |
| `src/app/layout.tsx` | Root layout — wraps every page with `<Navbar/>`, `<CartProvider/>`. |
| `src/app/page.tsx` | **Home** — featured products fetched server-side from Fastify. |
| `src/app/login/page.tsx` | Login form → posts to Express. |
| `src/app/signup/page.tsx` | Signup form. |
| `src/app/dashboard/page.tsx` | User dashboard (orders, profile). |
| `src/app/products/page.tsx` | **PLP** — list + search + filters. |
| `src/app/products/[id]/page.tsx` | **PDP** — product detail + reviews + Add to Cart. |
| `src/app/cart/page.tsx` | Cart with qty controls & subtotal. |
| `src/app/checkout/page.tsx` | Address form → creates order. |
| `src/app/payment/page.tsx` | Calls Java service for payment intent → confirm. |
| `src/components/Navbar.tsx` | Header with logo, search, cart icon, user menu. |
| `src/components/ProductCard.tsx` | Reusable product tile (used in home & PLP). |
| `src/components/Footer.tsx` | Footer. |
| `src/context/CartContext.tsx` | React Context for cart state (localStorage + server sync). |
| `src/lib/api.ts` | Centralized `fetch` wrappers for each backend service. |
| `src/lib/auth.ts` | Token storage / retrieval helper. |
| `src/styles/globals.css` | Tailwind-like utility CSS reset & basic styles. |

**Auth flow on client**: `lib/auth.ts` stores JWT in `localStorage`; `lib/api.ts` automatically attaches `Authorization: Bearer <token>` to every backend call.

---

## 4. Express Service — `backend/express-service/`

Handles **Users + Auth**. Uses **PostgreSQL via Prisma**.

| File | Purpose |
|------|---------|
| `package.json` | Deps: express, prisma, bcrypt, jsonwebtoken, zod, cors. |
| `tsconfig.json` | TS to ES2022. |
| `prisma/schema.prisma` | `User` model with email, hashed password, name, addresses. |
| `src/index.ts` | Boots Express, mounts routes, CORS, JSON parser, error handler. |
| `src/db/prisma.ts` | Singleton PrismaClient. |
| `src/middleware/auth.ts` | Verifies JWT, attaches `req.user`. |
| `src/middleware/error.ts` | Centralized error → JSON. |
| `src/routes/auth.ts` | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`. |
| `src/routes/users.ts` | `GET /users/:id`, `PATCH /users/:id`, addresses CRUD. |
| `src/utils/jwt.ts` | `sign()` / `verify()` helpers. |
| `src/utils/validate.ts` | Zod schemas for signup/login. |

**Signup logic** (`routes/auth.ts`):
1. Validate body with Zod.
2. Check email uniqueness.
3. `bcrypt.hash` password (10 rounds).
4. Insert via Prisma.
5. Issue JWT (24h expiry).
6. Return `{ user, token }`.

---

## 5. Fastify Service — `backend/fastify-service/`

Handles **Products, Cart, Orders**. Uses **MongoDB** (native driver).

| File | Purpose |
|------|---------|
| `package.json` | Deps: fastify, @fastify/cors, mongodb, zod. |
| `src/index.ts` | Boots Fastify, registers CORS + routes, seeds products on first run. |
| `src/db/mongo.ts` | MongoClient singleton, exposes `db()`. |
| `src/routes/products.ts` | `GET /products` (filters, search, pagination), `GET /products/:id`. |
| `src/routes/cart.ts` | `GET /cart/:userId`, `POST /cart/:userId/items`, `DELETE /cart/:userId/items/:productId`. |
| `src/routes/orders.ts` | `POST /orders`, `GET /orders/:userId`, `PATCH /orders/:id/paid`. |
| `src/seed.ts` | Seeds 20 sample products if collection empty. |

**Cart document shape** (MongoDB):
```json
{
  "_id": "userId",
  "items": [{ "productId": "...", "qty": 2, "price": 999 }],
  "updatedAt": "ISODate"
}
```

---

## 6. Java Service — `backend/java-service/`

**Spring Boot 3 + Java 17**. Handles payments.

| File | Purpose |
|------|---------|
| `pom.xml` | Maven dependencies (spring-boot-starter-web, validation). |
| `src/main/java/com/ecom/payment/PaymentApplication.java` | Spring Boot main class. |
| `controller/PaymentController.java` | `POST /payments/intent`, `POST /payments/verify`, `GET /payments/{id}`. |
| `service/PaymentService.java` | In-memory map of payment intents (swap for DB/Stripe). |
| `model/Payment.java` | DTO + status enum (PENDING, PAID, FAILED). |
| `config/CorsConfig.java` | Allows frontend origin. |
| `resources/application.properties` | Port 4003, actuator enabled. |

**Payment flow**:
1. `POST /payments/intent { orderId, amount }` → returns `{ paymentId, clientSecret }`.
2. (Real impl would redirect to Stripe/Razorpay.)
3. `POST /payments/verify { paymentId, signature }` → marks PAID.
4. Frontend then notifies Fastify to update order.

---

## 7. Databases

### Postgres (Prisma migrations in `backend/express-service/prisma/migrations/`)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  addresses Address[]
  createdAt DateTime @default(now())
}

model Address {
  id     String @id @default(cuid())
  userId String
  line1  String
  city   String
  state  String
  pin    String
  user   User   @relation(fields: [userId], references: [id])
}
```

### MongoDB collections

- `products` — `{ _id, title, description, price, category, image, stock, rating }`
- `carts` — `{ _id: userId, items: [...] }`
- `orders` — `{ _id, userId, items, total, status, address, paymentId, createdAt }`

---

## 8. Environment Variables (`.env.example`)

```
# Postgres
DATABASE_URL=postgresql://ecom:ecom@localhost:5432/ecom

# Mongo
MONGO_URL=mongodb://localhost:27017
MONGO_DB=ecom

# JWT
JWT_SECRET=change_me_super_secret

# Service URLs (frontend)
NEXT_PUBLIC_AUTH_URL=http://localhost:4001
NEXT_PUBLIC_CATALOG_URL=http://localhost:4002
NEXT_PUBLIC_PAYMENT_URL=http://localhost:4003
```

---

## 9. Running Locally — Step by Step

1. `docker compose up -d` — starts Postgres + Mongo.
2. `npm install` at root — installs all JS workspaces.
3. `cd backend/express-service && npx prisma migrate dev` — creates SQL tables.
4. `cd backend/java-service && ./mvnw spring-boot:run` — launches Java.
5. `npm run dev:express` / `dev:fastify` / `dev:frontend` in separate terminals.
6. Browse http://localhost:3000.

`init.sh` automates 1-3.

---

## 10. Extension Points

| Feature | Where to add |
|---------|--------------|
| Wishlist | New Fastify route + Mongo collection |
| Reviews | Extend `products.ts` or new collection |
| Admin panel | New Next.js route group `/admin/*` |
| Search (Elastic) | Sidecar service consuming product events |
| Email/SMS notifications | New Java module or Node worker |
| Recommendations | ML microservice (Python) reading orders |
| Coupons | Add `coupons` collection + checkout hook |
| Image uploads | S3 + presigned URLs from Express |

---

## 11. Security Notes (production checklist)

- Replace `JWT_SECRET` with a 256-bit random value via secret manager.
- Use HTTP-only cookies instead of localStorage for tokens.
- Add rate limiting (express-rate-limit, @fastify/rate-limit).
- Add Helmet headers on every service.
- Validate every input with Zod / Jakarta Validation (already wired).
- Use real payment gateway (Stripe / Razorpay) — current Java service is a simulator.
- Add CSRF protection on state-changing endpoints.
- Encrypt PII at rest (Postgres pgcrypto).

---

That's the full map. Each file has inline comments too. Start from [frontend/src/app/page.tsx](frontend/src/app/page.tsx) and follow the imports to learn the codebase.
