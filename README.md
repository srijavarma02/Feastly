# KateringKing — Luxury Hyderabadi Catering

> Crafted for Taste. Engineered for Elegance.

A full-stack catering website with a customer-facing landing page, manager dashboard, JWT authentication, dynamic CMS, and MongoDB backend.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Install Dependencies](#install-dependencies)
  - [Seed the Database](#seed-the-database)
  - [Run the Backend](#run-the-backend)
- [Pages](#pages)
- [Manager Dashboard](#manager-dashboard)
- [API Reference](#api-reference)
- [Deployment](#deployment)

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JS (ES6+)          |
| Backend   | Node.js, Express 5, MongoDB, Mongoose   |
| Auth      | JWT (jsonwebtoken) + bcryptjs           |
| Email     | Nodemailer (Gmail App Password)         |
| Charts    | Chart.js 4 (CDN)                        |
| Deploy    | Vercel (frontend) + Render (backend)    |

---

## Project Structure

```
Feastly/
├── index.html          # Customer site
├── login.html          # Manager login page
├── dashboard.html      # Manager dashboard (SPA)
├── vercel.json         # Vercel deployment config
├── assets/
│   ├── css/
│   │   ├── styles.css      # Main site styles
│   │   └── dashboard.css   # Dashboard styles
│   ├── js/
│   │   ├── main.js         # Customer site JS
│   │   ├── login.js        # Login form handler
│   │   └── dashboard.js    # Dashboard JS (bookings, charts, CMS)
│   ├── pictrues/           # Food & event images
│   └── video/              # Dish showcase videos
└── backend/
    ├── server.js
    ├── .env                # Environment variables (not committed)
    ├── models/
    │   ├── Booking.js
    │   ├── Content.js
    │   └── User.js
    ├── routes/
    │   ├── auth.js         # POST /api/auth/login, GET /api/auth/me
    │   ├── bookings.js     # CRUD for bookings
    │   └── content.js      # GET/PUT /api/content
    ├── middleware/
    │   └── auth.js         # requireAuth, requireManager
    ├── utils/
    │   └── mailer.js       # Nodemailer email helpers
    └── scripts/
        ├── seedManager.js  # Create manager account
        └── seedContent.js  # Populate default CMS content
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### Environment Variables

Create `backend/.env` with the following keys:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/feastly

# Email (Gmail App Password)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
OWNER_EMAIL=your-gmail@gmail.com

# Auth
JWT_SECRET=change-this-to-a-long-random-secret
MANAGER_EMAIL=manager@example.com
MANAGER_PASSWORD=YourStrongPassword123

# CORS
FRONTEND_URL=https://your-vercel-url.vercel.app
```

### Install Dependencies

```bash
cd backend
npm install
```

### Seed the Database

Run these scripts once to create the manager account and default CMS content:

```bash
# 1. Create manager account (uses MANAGER_EMAIL + MANAGER_PASSWORD from .env)
node backend/scripts/seedManager.js

# 2. Populate default site content
node backend/scripts/seedContent.js
```

Both scripts are safe to re-run — they skip entries that already exist.

### Run the Backend

```bash
# Development (with auto-reload)
cd backend && npm run dev

# Production
cd backend && npm start
```

The API will be available at `http://localhost:5000`.

---

## Pages

| Page              | URL                  | Access  |
|-------------------|----------------------|---------|
| Customer Site     | `/index.html`        | Public  |
| Manager Login     | `/login.html`        | Public  |
| Manager Dashboard | `/dashboard.html`    | Manager JWT required |

---

## Manager Dashboard

1. Open `/login.html`
2. Enter the `MANAGER_EMAIL` and `MANAGER_PASSWORD` from your `.env`
3. You will be redirected to `/dashboard.html`

**Dashboard features:**
- **Bookings** — full table with status dropdowns, delete buttons, and status filter
- **Analytics** — doughnut chart (event types), bar chart (monthly bookings), stat cards
- **Content Editor** — edit hero tagline/desc, about text, testimonials (add/remove/edit), pricing packages
- **View Site** — opens customer site in a new tab with a "Back to Dashboard" banner
- **Logout** — clears JWT from localStorage

---

## API Reference

### Auth

| Method | Endpoint          | Auth     | Description               |
|--------|-------------------|----------|---------------------------|
| POST   | `/api/auth/login` | None     | Login, returns JWT token  |
| GET    | `/api/auth/me`    | Bearer   | Returns current user info |

### Bookings

| Method | Endpoint                      | Auth    | Description               |
|--------|-------------------------------|---------|---------------------------|
| POST   | `/api/bookings`               | None    | Submit booking enquiry    |
| GET    | `/api/bookings`               | Manager | List all bookings         |
| GET    | `/api/bookings/:id`           | None    | Get single booking        |
| PATCH  | `/api/bookings/:id/status`    | Manager | Update booking status     |
| DELETE | `/api/bookings/:id`           | Manager | Delete a booking          |

### Content (CMS)

| Method | Endpoint              | Auth    | Description                  |
|--------|-----------------------|---------|------------------------------|
| GET    | `/api/content`        | None    | Get all content as flat obj  |
| PUT    | `/api/content/:key`   | Manager | Update a content key         |

---

## Deployment

**Frontend (Vercel):**
```bash
# Push to GitHub — Vercel auto-deploys from main branch
git push origin main
```

**Backend (Render):**
1. Create a new Web Service on [render.com](https://render.com)
2. Set root directory to `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `backend/.env`
6. Update `BACKEND_BASE` URLs in `assets/js/main.js`, `login.js`, and `dashboard.js` with your Render URL

---

*KateringKing — Hyderabad · Crafting Culinary Excellence*
