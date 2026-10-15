# KateringKing — Website Documentation
> **Crafted for Taste. Engineered for Elegance.**
> Official website for KateringKing.com — a luxury Hyderabadi catering brand specialising in authentic cuisine and premium event services.

---

## Table of Contents  

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Running Locally](#4-running-locally)
5. [Page Sections](#5-page-sections)
6. [File Descriptions](#6-file-descriptions)
7. [Backend API](#7-backend-api)
8. [Deployment](#8-deployment)
9. [Environment Variables](#9-environment-variables)
10. [Design System](#10-design-system)
11. [Fonts](#11-fonts)
12. [Contact & Social Links](#12-contact--social-links)
13. [How to Make Common Updates](#13-how-to-make-common-updates)

---

## 1. Project Overview

KateringKing is a **full-stack website** with a static HTML/CSS/JS frontend and a Node.js/Express backend. The frontend is a single-page website showcasing the brand, menu, and services. The backend handles booking enquiries — saving them to MongoDB and sending email notifications via Gmail.

The website:
- Showcases the brand's identity and Hyderabadi culinary heritage
- Displays the full catering menu with food photography and videos
- Describes three service offerings (Weddings, Corporate, Private Dining)
- Accepts booking enquiries via a form (saved to DB + email notification sent)
- Has floating WhatsApp and phone contact buttons
- Works fully on desktop, tablet, and mobile

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas in production, local in dev) |
| ODM | Mongoose |
| Email | Nodemailer (Gmail) |
| Fonts | Google Fonts (CDN) |
| Images | Local files + Unsplash CDN |
| Videos | Local MP4 files |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| DB hosting | MongoDB Atlas |

---

## 3. Project Structure

```
KateringKing/
│
├── index.html                  ← Entire frontend (single HTML file)
├── vercel.json                 ← Vercel deployment config
├── .gitignore                  ← Excludes node_modules and .env
├── README.md                   ← This file
│
├── assets/
│   ├── css/
│   │   └── styles.css          ← All styling
│   ├── js/
│   │   └── main.js             ← All interactivity, form submission
│   ├── pictrues/               ← All images (note: folder name has typo — do not rename)
│   └── video/                  ← All MP4 videos
│
└── backend/
    ├── server.js               ← Express app entry point
    ├── package.json
    ├── .env                    ← Local env vars (never committed to git)
    ├── .gitignore
    ├── models/
    │   └── Booking.js          ← Mongoose schema for booking enquiries
    ├── routes/
    │   └── bookings.js         ← CRUD routes for /api/bookings
    └── utils/
        └── mailer.js           ← Nodemailer — owner + customer emails
```

> The images folder is named `pictrues` (a spelling variation). Do not rename it — the website references this exact folder name throughout.

---

## 4. Running Locally

### Frontend only

No installation required. Open `index.html` directly in a browser — or use the **Live Server** extension in VS Code for video autoplay to work.

### Frontend + Backend (full stack)

**Prerequisites:** Node.js, MongoDB running locally (`mongod`)

```
# 1. Install backend dependencies
cd backend
npm install

# 2. Create your .env file (copy from the template below)
# backend/.env

# 3. Start the backend
npm run dev        ← uses nodemon (auto-restarts on change)
# or
npm start          ← plain node

# 4. Open index.html in a browser (or Live Server)
```

The backend runs on `http://localhost:5000`.  
The form in `main.js` auto-detects localhost and points there during development.

### backend/.env template

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/kateringking
FRONTEND_URL=*
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
OWNER_EMAIL=your-gmail@gmail.com
```

> For `EMAIL_PASS`, use a Gmail App Password — not your real Gmail password.
> Google Account → Security → 2-Step Verification → App Passwords

---

## 5. Page Sections

The website is one long scrollable page. Each section has an ID the navigation links scroll to.

| # | Section | ID | Description |
|---|---|---|---|
| 1 | Hero | `#hero` | Full-screen video background, brand name, tagline, two CTA buttons |
| 2 | About Us | `#about-us` | Brand origin, founder's vision, three credential pillars |
| 3 | Hospitality | `#about` | Service philosophy, 20+ years / 500+ events / 100% authentic stats |
| 4 | Menu | `#menu` | Tabbed menu — Signature Reserve + Heritage Archive |
| 5 | Services | `#services` | Three service cards — Weddings, Corporate, Private Dining |
| 6 | Plan Your Event | `#contact` | Booking enquiry form (submits to backend API) |

### Menu Tabs

**Tab 1 — The Signature Reserve**
- Course I: Royal Roasts & Cuts (Kareli Roast)
- Course II: Artisanal Bites (Warqi Samosa, Lukmi)
- Course III: Centerpieces (Murgh Mussallam, Phattar Ka Gosht, Dum Ke Chops, Cold Fish Salads)

**Tab 2 — The Heritage Archive**
- Course I: First Course — 7 starters with photos/videos
- Course II: Main Course — Non-Veg Curries + Vegetarian Classics
- Course III: The Dastarkhwan — 4 Biryanis (full-bleed background)
- Course IV: The Final Act — 3 Desserts (Double Ka Meetha, Qubani Ka Meetha, Badam Ki Kheer)

---

## 6. File Descriptions

### index.html

The entire frontend in one file (~47 KB). Structure:

```
<head>     — Metadata, Google Fonts, styles.css
<header>   — Fixed nav bar (desktop links + hamburger)
<div>      — Mobile menu overlay
<main>
  Hero → About Us → Hospitality → Menu → Services → Booking Form
  Floating WhatsApp button
  Floating phone button
<footer>   — Logo, nav links, social icons, copyright year
<script>   — main.js
```

### styles.css (~53 KB)

All visual styling in one file. Key sections:

| Section | Controls |
|---|---|
| `:root` | CSS variables — colours, fonts, spacing |
| Navigation | Fixed nav, scroll state, hamburger, mobile overlay |
| Hero | Full-screen video, overlay, animated entrance |
| About / Hospitality | Two-column layout, stats |
| Menu | Tabs, sticky tab bar, dish cards, biryani section, desserts |
| Services | Three-card grid with hover |
| Booking Form | Form layout, input styles, status messages |
| Floating Buttons | WhatsApp (green) and phone (gold) with pulse animation |
| Responsive | Breakpoints at 1024px, 768px, 480px |

### main.js (~12 KB)

All interactivity. Self-contained IIFE functions:

| Function | Purpose |
|---|---|
| `initNav` | Transparent nav over hero → dark on scroll |
| `initMobileMenu` | Full-screen mobile overlay, Escape key, resize handling |
| `initSmoothScroll` | Smooth anchor scrolling with nav height offset |
| `initScrollReveal` | IntersectionObserver fade/slide animations |
| `initMenuTabs` | Tab switching + keyboard arrow navigation |
| `initVideoFallback` | Hides hero video if autoplay blocked |
| `setFooterYear` | Auto-sets copyright year |
| `initActiveNavLink` | Highlights active nav link on scroll |
| `initBookingForm` | Collects form data, POSTs to `/api/bookings`, shows success/error |

The API URL auto-detects environment:
- `localhost` / `127.0.0.1` → `http://localhost:5000`
- Any other host → production Render URL

### backend/models/Booking.js

Mongoose schema with these fields:

| Field | Type | Required |
|---|---|---|
| `name` | String | Yes |
| `phone` | String | Yes |
| `email` | String | Yes |
| `eventType` | Enum | Yes |
| `eventDate` | Date | Yes |
| `guestCount` | Number | Yes |
| `venue` | String | Yes |
| `services` | [String] | No |
| `message` | String | No |
| `status` | Enum (Pending/Reviewed/Confirmed/Cancelled) | Auto: Pending |

### backend/utils/mailer.js

Sends two emails on every new booking:
1. **Owner notification** — full booking details table sent to `OWNER_EMAIL`
2. **Customer confirmation** — enquiry summary + contact details sent to the customer

Both run in parallel via `Promise.allSettled` — a mailer failure never breaks the API response.

---

## 7. Backend API

Base URL (production): `https://kateringking-backend.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns `{ ok: true }` |
| `POST` | `/api/bookings` | Create a new booking enquiry |
| `GET` | `/api/bookings` | List all bookings (admin) — supports `?status=Pending` |
| `GET` | `/api/bookings/:id` | Get single booking by ID |
| `PATCH` | `/api/bookings/:id/status` | Update booking status (admin) |
| `DELETE` | `/api/bookings/:id` | Delete a booking (admin) |

### POST /api/bookings — example request body

```json
{
  "name": "Mohammed Ali",
  "phone": "+91 98490 00000",
  "email": "guest@example.com",
  "eventType": "Wedding",
  "eventDate": "2027-03-15",
  "guestCount": 300,
  "venue": "Aura Convention, Hyderabad",
  "services": ["Full Catering", "Service Staff Only"],
  "message": "Need Zafrani Biryani as the main dish."
}
```

### POST /api/bookings — example success response

```json
{
  "success": true,
  "message": "Booking enquiry received. We will get back to you shortly.",
  "data": { ...booking object }
}
```

---

## 8. Deployment

| Part | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://kateringking.vercel.app |
| Backend | Render | https://kateringking-backend.onrender.com |
| Database | MongoDB Atlas | kateringking cluster (ap-south-1, Mumbai) |

### Deploying the frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → New Project → import `Feastly` repo
2. Framework preset: **Other**
3. Root directory: `.` (repo root, not `backend`)
4. Build command: *(leave blank)*
5. Click Deploy

### Deploying the backend (Render)

1. Go to [render.com](https://render.com) → New Web Service → import `Feastly` repo
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables (see section below)
6. Click Create Web Service

### After both are deployed

- Update `FRONTEND_URL` in Render env vars to your actual Vercel URL
- Update `BACKEND_BASE` in `assets/js/main.js` to your actual Render URL → commit + push → Vercel auto-redeploys

---

## 9. Environment Variables

These go in Render's Environment tab (never commit them to git).

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `EMAIL_USER` | Gmail address that sends emails |
| `EMAIL_PASS` | Gmail App Password (16 characters, with spaces) |
| `OWNER_EMAIL` | Email that receives booking notifications |
| `FRONTEND_URL` | Vercel frontend URL (for CORS) |
| `PORT` | Optional — Render sets this automatically |

---

## 10. Design System

### Colour palette

| Variable | Hex | Used for |
|---|---|---|
| `--navy` | `#0D1B2A` | Primary dark background |
| `--navy-mid` | `#152233` | Cards, nav scrolled state |
| `--gold` | `#C9A84C` | Borders, icons, primary buttons |
| `--gold-light` | `#E2C47A` | Hover states, active tab |
| `--cream` | `#F0EBE0` | Text on dark backgrounds |
| `--ivory` | `#F5F0EA` | Light section backgrounds |
| `--silver` | `#B8C0CC` | Subtle text accents |

All colours are defined as CSS custom properties in the `:root` block of `styles.css`.

### Typography

| Font | Type | Used for |
|---|---|---|
| Cormorant Garamond | Serif | All headings and section titles |
| Playfair Display | Serif | Display headings (secondary) |
| Inter | Sans-serif | Body text, labels, buttons, nav |

### Animations

- Scroll reveal: `reveal-up`, `reveal-left`, `reveal-right` — triggered by `IntersectionObserver`
- Hero text: staggered entrance animation on page load
- Images: subtle scale on hover
- Floating buttons: gold/green glow pulse animation

---

## 11. Fonts

Loaded from Google Fonts CDN. Requires an internet connection — falls back to system serif/sans-serif if offline.

---

## 12. Contact & Social Links

| Type | Value |
|---|---|
| Phone | `+91 9963220052` |
| WhatsApp | `+91 9963220052` |
| Instagram | [@kateringkingservices](https://www.instagram.com/kateringkingservices) |

To update the phone number: open `index.html`, use Find & Replace (`Ctrl+H`), search `9963220052` and replace all.

---

## 13. How to Make Common Updates

### Update the Render backend URL
Open `assets/js/main.js`, find `BACKEND_BASE` and replace the production URL string. Commit and push — Vercel redeploys automatically.

### Change a brand colour
Open `assets/css/styles.css` → `:root { }` block → update the relevant CSS variable.

### Add or replace a dish image
Drop the new file in `assets/pictrues/` → update the `src` in `index.html`.

### Add or replace a dish video
Drop the new `.mp4` in `assets/video/` → update the `<source src="...">` in `index.html`.

### Replace the hero video
Replace `assets/video/biryani.mp4` (currently used as hero) with a new file. Update the `src` in the hero `<video>` tag if using a different filename.

### Update the logo
Replace `assets/pictrues/Logo.jpeg` with a new file using the same name. It appears in the footer.

### View all booking enquiries
Hit the admin endpoint directly:
```
GET https://kateringking-backend.onrender.com/api/bookings
GET https://kateringking-backend.onrender.com/api/bookings?status=Pending
```

---

*Frontend: pure HTML/CSS/JS — open `index.html` and it works. Backend: Node/Express/MongoDB — requires env vars and a running server.*
