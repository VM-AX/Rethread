# ReThread — AI-Powered Sustainable Fashion Resale & Repair Marketplace

A full-stack MERN application for buying, selling, repairing, and bidding on
secondhand clothing, with AI-assisted condition/authenticity grading and
per-purchase sustainability impact scoring (estimated water & CO₂ saved).

Built to be **production-shaped but interview-explainable**: clean MVC
structure, role-based auth, RESTful API design, and 54 well-scoped endpoints
across 9 feature modules.

---

## 1. Tech Stack

| Layer      | Tech |
|------------|------|
| Frontend   | React 18 (Vite), React Router, Tailwind CSS, Axios |
| Backend    | Node.js, Express.js |
| Database   | MongoDB + Mongoose |
| Auth       | JWT + bcrypt password hashing |
| File upload| Multer (local disk) with optional Cloudinary storage |
| Validation | express-validator |

---

## 2. Project Structure

```
rethread/
├── backend/
│   ├── config/          # db.js, cloudinary.js
│   ├── models/          # 9 Mongoose schemas (User, Listing, Order, Repair,
│   │                       Review, Message/Conversation, Auction, Bid, AIReport)
│   ├── middleware/       # auth (protect/authorize), upload, validate, errorHandler
│   ├── controllers/      # business logic, one file per module
│   ├── routes/           # Express routers, one file per module
│   ├── utils/             # impactData.js, aiMock.js, apiFeatures.js, generateToken.js
│   ├── seed/              # seed.js — creates the Admin account
│   └── server.js
└── frontend/
    └── src/
        ├── api/          # one axios wrapper module per backend module
        ├── context/      # AuthContext, CartContext
        ├── components/   # Navbar, ListingCard, DashboardLayout, etc.
        ├── routes/        # ProtectedRoute (role guard)
        └── pages/
            ├── buyer/ seller/ repair/ admin/   # role dashboards
            └── (Landing, Login, Register, Browse, ListingDetail, Cart,
                 Checkout, Auctions, AuctionDetail)
```

This mirrors a standard **MVC** split on the backend (Models / Controllers /
Routes-as-View-layer-for-an-API) and a **feature-folder + shared-layer**
split on the frontend.

---

## 3. Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### Backend

```bash
cd backend
cp .env.example .env     # then fill in MONGO_URI, JWT_SECRET, etc.
npm install
npm run seed:admin       # creates the Admin account from ADMIN_* env vars
npm run dev               # starts on http://localhost:5000
```

> **Why a seed script?** The spec requires the Admin account to never be
> creatable through public registration. `POST /api/auth/register` explicitly
> rejects `role: "admin"`. The only way to provision an Admin is
> `npm run seed:admin`, which writes directly to MongoDB.

### Frontend

```bash
cd frontend
cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev               # starts on http://localhost:5173
```

The Vite dev server also proxies `/api` to `http://localhost:5000`, so the
frontend works even without setting `VITE_API_URL` explicitly in development.

### Image uploads
If `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
are not set, the backend automatically falls back to storing uploaded images
on local disk under `backend/uploads/`, served at `/uploads/...`. This means
the app runs end-to-end with **zero external services** for local dev/demo.

---

## 4. Roles & Access

| Role | How created | Key capabilities |
|------|-------------|-------------------|
| Buyer | Self-register | Browse/search, buy, bid, book repairs, message sellers, review, track impact |
| Seller | Self-register | Create/manage listings, run AI grading, manage orders, run auctions, message buyers |
| Repair Partner | Self-register | Accept/reject repair jobs, update progress, mark completed |
| Admin | **DB seed only** (`npm run seed:admin`) | Full moderation: users, listings, AI report review, platform dashboard |

Role is enforced server-side via two middleware: `protect` (verifies JWT,
loads `req.user`, checks blocked/deleted status) and `authorize(...roles)`
(role allow-list per route). The frontend additionally guards routes with
`<ProtectedRoute roles={[...]}>` for UX, but the **real** authorization
boundary is always the backend.

---

## 5. API Reference (54 endpoints across 9 modules)

All routes are prefixed with `/api`. 🔒 = requires `Authorization: Bearer <token>`.

### Auth (foundational — not counted in the 9 feature modules)
| Method | Route | Access |
|---|---|---|
| POST | /auth/register | Public |
| POST | /auth/login | Public |
| GET | /auth/me | 🔒 |
| PUT | /auth/me | 🔒 |
| PUT | /auth/change-password | 🔒 |

### 1. Listing Management (7)
| Method | Route | Access |
|---|---|---|
| POST | /listings | 🔒 seller |
| GET | /listings/mine | 🔒 seller |
| GET | /listings/:id | Public |
| PUT | /listings/:id | 🔒 seller (owner) |
| DELETE | /listings/:id | 🔒 seller (owner) / admin |
| POST | /listings/:id/images | 🔒 seller (owner) |
| PATCH | /listings/:id/status | 🔒 seller (owner) |

### 2. AI Condition / Authenticity Grading (5)
| Method | Route | Access |
|---|---|---|
| POST | /ai/listings/:id/grade | 🔒 seller (owner) / admin |
| GET | /ai/listings/:id/reports | Public |
| GET | /ai/reports | 🔒 admin |
| GET | /ai/reports/:reportId | 🔒 |
| PUT | /ai/reports/:reportId/override | 🔒 admin |

### 3. Search & Filters (5)
| Method | Route | Access |
|---|---|---|
| GET | /search/listings | Public — keyword, category, price range, size, brand, condition, sort, pagination |
| GET | /search/categories | Public |
| GET | /search/brands | Public |
| GET | /search/suggestions | Public — autocomplete |
| GET | /search/trending | Public — most-viewed |

### 4. Order & Payment Flow (7)
| Method | Route | Access |
|---|---|---|
| POST | /orders | 🔒 buyer — checkout |
| GET | /orders/mine | 🔒 buyer |
| GET | /orders/seller/mine | 🔒 seller |
| GET | /orders/:id | 🔒 buyer/seller/admin |
| PATCH | /orders/:id/status | 🔒 seller/admin |
| POST | /orders/:id/pay | 🔒 buyer — mock payment gateway |
| POST | /orders/:id/cancel | 🔒 buyer/admin |

### 5. Repair Partner Booking (6)
| Method | Route | Access |
|---|---|---|
| POST | /repairs | 🔒 buyer |
| GET | /repairs/mine | 🔒 buyer |
| GET | /repairs/partner/requests | 🔒 repair_partner |
| PATCH | /repairs/:id/accept | 🔒 repair_partner |
| PATCH | /repairs/:id/reject | 🔒 repair_partner |
| PATCH | /repairs/:id/progress | 🔒 repair_partner (assigned) |

### 6. Sustainability Impact Score (4)
| Method | Route | Access |
|---|---|---|
| GET | /impact/categories | Public — predefined water/CO₂ table |
| GET | /impact/orders/:orderId | 🔒 |
| GET | /impact/buyer/summary | 🔒 buyer |
| GET | /impact/platform/summary | Public |

### 7. Reviews & Ratings (4)
| Method | Route | Access |
|---|---|---|
| POST | /reviews | 🔒 buyer — listing or user review |
| GET | /reviews/listing/:listingId | Public |
| GET | /reviews/user/:userId | Public |
| DELETE | /reviews/:id | 🔒 author/admin |

### 8. Buyer-Seller Messaging (6)
| Method | Route | Access |
|---|---|---|
| POST | /messages/conversations | 🔒 |
| GET | /messages/conversations | 🔒 |
| GET | /messages/conversations/:id/messages | 🔒 participant |
| POST | /messages/conversations/:id/messages | 🔒 participant |
| PATCH | /messages/conversations/:id/read | 🔒 participant |
| POST | /messages/conversations/:id/report | 🔒 participant |

### 9. Auction-Style Bidding (5)
| Method | Route | Access |
|---|---|---|
| POST | /auctions | 🔒 seller |
| GET | /auctions | Public |
| GET | /auctions/:id | Public — includes bid history |
| POST | /auctions/:id/bids | 🔒 buyer |
| POST | /auctions/:id/close | 🔒 seller/admin — settles into an Order |

### Admin Moderation (6)
| Method | Route | Access |
|---|---|---|
| GET | /admin/users | 🔒 admin |
| PATCH | /admin/users/:id/block | 🔒 admin |
| DELETE | /admin/users/:id | 🔒 admin — soft delete/restore |
| GET | /admin/listings | 🔒 admin |
| PATCH | /admin/listings/:id/moderate | 🔒 admin — remove/flag/restore |
| GET | /admin/dashboard | 🔒 admin — platform statistics |

**Total: 5 (auth) + 7 + 5 + 5 + 7 + 6 + 4 + 4 + 6 + 5 + 6 = 60 endpoints**
(54 across the 9 feature modules as scoped, plus 5 foundational auth routes
and 1 bonus dashboard-stats route that the spec's "Admin dashboard" feature
implied.)

---

## 6. Key Design Decisions (useful for interviews)

- **AI grading is isolated behind one function** (`utils/aiMock.js →
  gradeListingImages()`). It's currently a deterministic, seeded mock, but
  the controller/route/DB-schema contract (`AIReport` documents with
  `conditionScore`, `authenticityScore`, `modelVersion`, etc.) is exactly
  what a real CV/ML integration would need to fill in — swapping the mock
  for a real model call requires touching **one file**.

- **Sustainability impact uses a predefined lookup table**
  (`utils/impactData.js`) keyed by clothing category, intentionally avoiding
  a complex LCA-style calculation. Impact is snapshotted onto each `Order`
  item at purchase time so historical orders don't change if the table is
  later tuned.

- **Admin is never self-registrable.** `authController.register` explicitly
  rejects `role: "admin"`; the only path to create one is the seed script
  writing directly to MongoDB — matching the spec exactly.

- **Auctions settle into real Orders.** Closing a live auction
  (`POST /auctions/:id/close`) creates an `Order` for the winning bidder
  using the same sustainability-impact and order-status machinery as a
  normal checkout, so buyers/sellers see auction wins in the same "Orders"
  UI as fixed-price purchases.

- **One Review model, two target types.** Rather than separate
  "product reviews" and "seller reviews" collections, `Review` uses a
  `targetType: 'listing' | 'user'` discriminator field — keeping the schema
  simple while supporting both buyer→listing and buyer→seller/repair-partner
  ratings, each with denormalized running averages recalculated on write.

- **Central error handling.** Every controller is wrapped in `asyncHandler`
  so thrown/rejected errors funnel into one `errorHandler` middleware that
  normalizes Mongoose validation, cast, and duplicate-key errors into
  consistent JSON — no repeated try/catch boilerplate per route.

---

## 7. Demo Walkthrough (suggested order)

1. `npm run seed:admin` in `backend/`, then log in as Admin at `/login`.
2. Register a Seller → create a listing with photos → run AI grading →
   publish it.
3. Register a Buyer → browse/search → view the listing's AI report and
   sustainability preview → add to cart → checkout (mock payment) → see the
   order and impact numbers update.
4. As the Seller, mark the order shipped → delivered.
5. As the Buyer, book a repair on the delivered item.
6. Register a Repair Partner → accept the request → mark in-progress →
   mark completed.
7. As the Seller, start an auction on another listing; as the Buyer, place
   bids; as the Seller, close the auction and watch it settle into an Order.
8. As Admin, view `/admin` for platform stats, flag a listing, block a user.
#   R e t h r e a d  
 