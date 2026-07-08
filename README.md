# 🔧 FixItNow — Home Service Marketplace API

**FixItNow** is a backend API for a home services marketplace. Customers can browse services, book technicians, make payments, and leave reviews. Technicians manage profiles and bookings. Admins oversee the platform.

---

## 🚀 Quick Start

```bash
git clone https://github.com/nurulla-hasan/L2B7A4.git
cd L2B7A4
npm install
cp .env.example .env    # Edit with your DB credentials
npx prisma migrate dev
npm run dev
```

Server runs on **http://localhost:5000** 🎉

### Admin Credentials

| Email | Password |
|-------|----------|
| `admin@fixitnow.com` | `admin123` |

---

## 🗄️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js + Express 5 | REST API |
| TypeScript 6 | Type safety |
| Prisma 7 + PostgreSQL | Database |
| JWT + bcryptjs | Authentication |
| Zod 4 | Input validation |
| SSLCommerz | Payment gateway |

---

## 📁 Project Structure

```
L2B7A4/
├── prisma/
│   ├── schema/        # Modular schema files
│   ├── migrations/    # DB migrations
│   └── seed.ts        # Database seeder
├── src/
│   ├── middleware/     # Auth, validation, error handling
│   ├── module/         # Feature modules (auth, booking, payment, etc.)
│   ├── utils/          # AppError, JWT, response helpers
│   └── validation/     # Zod schemas
├── docs/
│   └── postman_collection.json
└── .env.example
```

---

## � API Documentation

Complete API documentation with all **33+ endpoints** (Auth, Categories, Services, Technicians, Bookings, Payments, Reviews, Admin) is available as a **Postman Collection**:

📁 **`docs/postman_collection.json`** — Import into Postman to explore and test all endpoints.

### Module Overview

| Module | Description |
|--------|-------------|
| **Auth** | Register, login, profile management |
| **Categories & Services** | Browse and manage service categories |
| **Technicians** | Profiles, availability, booking management |
| **Bookings** | Create, track, and cancel bookings |
| **Payments** | SSLCommerz integration (create, callback, IPN) |
| **Reviews** | Rate and review completed services |
| **Admin** | User management, platform oversight |

---

## 📊 Database Schema

**Models:** User, TechnicianProfile, Category, Service, Booking, Payment, Review

**Enums:** Role (CUSTOMER/TECHNICIAN/ADMIN), BookingStatus (REQUESTED → ACCEPTED/DECLINED/CANCELLED → PAID → IN_PROGRESS → COMPLETED), PaymentStatus (PENDING/COMPLETED/FAILED)

**Booking Lifecycle:** `REQUESTED → ACCEPTED → PAID → IN_PROGRESS → COMPLETED`
- Customer can cancel (→ `CANCELLED`) from REQUESTED, ACCEPTED, or PAID status

---

## ✅ Assignment Requirements

| # | Requirement | Status |
|---|-------------|--------|
| 1 | API Documentation (Postman) | ✅ 33+ endpoints |
| 2 | Consistent Error Responses | ✅ `{ success, message, errorDetails }` |
| 3 | 20+ Meaningful Commits | ✅ 27 commits |
| 4 | Input Validation | ✅ Zod v4 on all endpoints |
| 5 | Admin Credentials | ✅ `admin@fixitnow.com` |
| 6 | Payment Integration | ✅ SSLCommerz (full flow) |

---

## 👨‍💻 Author

**Nurulla Hasan** — [@nurulla-hasan](https://github.com/nurulla-hasan)

---

<p align="center">Made for Programming Hero — L2B7A4 Assignment</p>
