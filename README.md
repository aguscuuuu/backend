# Hybrid Authentication System with Node.js

Backend API built with **Node.js + Express 5** that implements a **hybrid authentication system**: it combines **local login** (email + password with bcrypt), **GitHub OAuth**, **JWT** (signed tokens with expiration) and **server-side sessions** persisted in MongoDB. On top of that, it exposes versioned endpoints under `/api/v1` covering the full identity lifecycle: register, login, active session, token-protected routes, role-protected routes and logout.

The repository also includes a demo e-commerce application (products and carts with Handlebars views and real-time updates via Socket.IO) that reuses the same identity infrastructure.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Layered architecture](#layered-architecture)
- [Authentication strategies](#authentication-strategies)
- [API endpoints](#api-endpoints-apiv1)
- [Authentication flow](#authentication-flow)
- [Security](#security)
- [Local installation](#local-installation)
- [Environment variables](#environment-variables)
- [Usage examples](#usage-examples-curl)
- [License](#license)

---

## Features

- **User registration** with password hashing (bcrypt, 10 salt rounds) and duplicate validation.
- **Local login** via Passport Local Strategy.
- **GitHub OAuth login** (passport-github2) with automatic user provisioning.
- **JWT** with `{ userId, role }` payload and a **1-hour** expiration, delivered both in the **body** and in the **`authToken` cookie** (`httpOnly`, `sameSite: Lax`, `secure` in production).
- **Server-side sessions** with `express-session` + `connect-mongo` (persisted in MongoDB, 24 h TTL).
- **Protected routes** by JWT (`/profile`) and by role (`/admin`), with correct handling of **401** (unauthenticated) and **403** (unauthorized).
- **Logout** that destroys the session and clears cookies.
- **Centralized error handling** and **logging** with Winston.
- Environment variable validation at startup (*fail-fast*).

---

## Tech stack

| Category | Technology |
| --- | --- |
| Runtime | Node.js (ESM, `"type": "module"`) |
| Framework | Express 5 |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | Passport (local + github2), JSON Web Token, bcrypt |
| Sessions | express-session + connect-mongo |
| Views / real-time | express-handlebars + Socket.IO |
| Logging | Winston |
| Config | dotenv |

---

## Layered architecture

```
backend/
├── server.js                  # Entry point: HTTP server + Socket.IO + bootstrap
├── package.json
├── .env.example               # Environment variables template
└── src/
    ├── app.js                 # Express configuration (middlewares, session, routes)
    ├── config/                # Bootstrap: env, Mongo connection, logger, passport
    ├── models/                # Mongoose schemas (User, Product, Cart)
    ├── strategies/            # Passport strategies (local, github)
    ├── controllers/           # Request orchestration (auth, user, product, cart, views)
    ├── managers/              # Data access / service layer
    ├── middlewares/           # Access control (JWT, role, session) and utilities
    ├── routes/                # URL-to-controller mapping
    ├── utils/                 # Utilities (jwt, formatters)
    ├── views/                 # Handlebars templates
    └── public/                # Static assets
```

| Layer | Responsibility |
| --- | --- |
| `config` | Environment loading/validation, Mongo connection, logger and Passport strategy registration. *Bootstrap* layer, no business logic. |
| `models` | Data schemas with Mongoose and their constraints (e.g. unique email, role enum, password exclusion in `toJSON`). |
| `strategies` | Passport strategies. Each one is independent and decoupled from controllers and routes. |
| `controllers` | Receive `req`/`res`, invoke managers or Passport, build tokens/cookies and assemble the JSON response. They do not access the database directly. |
| `managers` | Service / data-access layer: encapsulate Mongoose (registration with hashing, lookups, duplicate validation, etc.). |
| `middlewares` | Access control (`verifyJWT`, `requireRole`, session guards), HTTP logging, validation and error handling. |
| `routes` | Define the URLs and apply the protection middlewares. |

---

## Authentication strategies

- **Local** (`passport-local`): validates `email` + `password` against MongoDB using `bcrypt.compare`. Generic message on failure so it never reveals which emails exist.
- **GitHub OAuth** (`passport-github2`): delegates verification to GitHub; if the user does not exist locally, it creates one with a random (UUID) hashed password.
- **JWT** (`jsonwebtoken`): signs `{ userId, role }` with `JWT_SECRET`, expires in 1 h. Accepted both from the `authToken` cookie and from the `Authorization: Bearer` header.
- **Server-side sessions** (`express-session` + `connect-mongo`): keep state for the views and for `GET /api/v1/session`; invalidated on logout.

> Why cookie **and** JWT? The `httpOnly` cookie is convenient and safe for browsers (immune to XSS reads); the JWT in the body enables the `Authorization: Bearer` pattern, explicit and CSRF-free, for API clients (Postman, SPA, mobile). The same token travels through both channels.

---

## API endpoints (`/api/v1`)

### Authentication

| Method | Route | Protection | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | User registration |
| `POST` | `/auth/login` | Public | Local login; issues JWT + cookie |
| `GET` | `/auth/github` | Public | Starts GitHub OAuth |
| `GET` | `/auth/github/callback` | Callback | Issues JWT and creates session |
| `GET` | `/auth/logout` | — | Destroys session and clears cookies |
| `GET` | `/session` | — | Returns the active server session |
| `GET` | `/profile` | JWT | Authenticated user data |
| `GET` | `/admin` | JWT + `admin` role | Administration panel |

### Legacy API (e-commerce)

| Method | Route | Description |
| --- | --- | --- |
| `GET/POST/PUT/DELETE` | `/api/products[/:pid]` | Products CRUD (with pagination/filters) |
| `GET/POST/PUT/DELETE` | `/api/carts[/:cid...]` | Cart management |
| `GET/POST/PUT/DELETE` | `/api/users[/:uid]` | Users CRUD |
| `GET` | `/`, `/products`, `/carts/:cid`, `/realtimeproducts` | Handlebars views |

---

## Authentication flow

```
LOCAL LOGIN (JWT)
  Client ── POST /auth/login {email,password} ──► Passport Local
         ◄── 200 { token, data } + Set-Cookie: authToken ──

GITHUB OAUTH
  Client ── GET /auth/github ──► redirect to GitHub ──► callback (code)
         ◄── findOne/create user + JWT + session + Set-Cookie ── 302 /

PROTECTED ROUTE
  Client ── GET /profile  (Cookie authToken | Bearer) ──► verifyJWT
         ── requireRole('admin')? ──► 200 / 401 / 403
```

---

## Security

- **The role lives in the database** (`role: 'user' | 'admin'`) and is propagated to the JWT payload and to `req.session.user`. Authorizing from the token is *stateless* (no database lookup per request).
- **Passwords** are always bcrypt-hashed; they are never serialized (`toJSON` transform).
- **CSRF**: `authToken` cookie with `SameSite=Lax` + `httpOnly`; the `Authorization: Bearer` transport is not susceptible to CSRF.
- **Local vs. production**: the cookie `secure` flag is only enabled when `NODE_ENV=production`; the log level adapts per environment.
- **JWT trade-off**: if a role changes while a token is still valid, the change is not reflected until the token expires (max. 1 h) or the user logs in again. Performance is prioritized, accepting a short inconsistency window. The server-side session is invalidated immediately on logout.

---

## Local installation

### Prerequisites
- Node.js 18 or higher (the project uses ESM).
- An accessible MongoDB instance (local or MongoDB Atlas).
- *(Optional)* A GitHub OAuth App to enable GitHub login.

### Steps

1) Clone and install dependencies
```sh
git clone https://github.com/aguscuuuu/backend.git
```
```sh
cd backend
```
```sh
npm install
```
2) Create the environment file from the template
```sh
cp .env.example .env          # Linux / macOS
```
```sh
Copy-Item .env.example .env   # Windows (PowerShell)
```
3) Edit `.env` with the real `MONGO_URL` and secrets

4) Start the server
```sh
npm start
```

On startup, `server.js` connects to MongoDB, launches the HTTP server with Socket.IO and opens the browser at `http://localhost:8080`. The authentication endpoints become available under `http://localhost:8080/api/v1`.

---

## Environment variables

Copy `.env.example` to `.env` and fill in the values. `src/config/env.js` validates at startup that the required ones are present and **aborts** if any is missing.

| Variable | Fill | Description |
| --- | --- | --- |
| `PORT` | ✅ | HTTP server port (defaults to `8080`). |
| `NODE_ENV` | ❌ | `development` \| `production` \| `test`. Controls the cookie `secure` flag and the log level. |
| `MONGO_URL` | ✅ | MongoDB connection string (used by Mongoose and by the session store). |
| `SESSION_SECRET` | ✅ | Secret used to sign the `express-session` cookie. |
| `JWT_SECRET` | ✅ | Key used to sign/verify JWTs (min. 32 random characters in production). |
| `GITHUB_CLIENT_ID` | ❌ | GitHub OAuth App Client ID. If missing, OAuth routes return `503`. |
| `GITHUB_CLIENT_SECRET` | ❌ | GitHub OAuth App Client Secret. |
| `GITHUB_CALLBACK_URL` | ❌ | Callback URL registered in GitHub. |

---

## Usage examples (curl)

Register
```sh
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ada","last_name":"Lovelace","email":"ada@example.com","age":28,"password":"secreta123"}'
```
Login (saves the cookie to cookies.txt)
```sh
curl -c cookies.txt -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"secreta123"}'
```
Protected route with Bearer
```sh
curl http://localhost:8080/api/v1/profile -H "Authorization: Bearer <TOKEN>"
```
Session and logout (with cookie)
```sh
curl -b cookies.txt http://localhost:8080/api/v1/session
curl -b cookies.txt http://localhost:8080/api/v1/auth/logout
```

---

## Status

- **Version:** `1.0.0`
- **Date:** `Jun 2026`

---

## Author

- **Agustín Cuenca** (`AgustinCuenca` · `aguabentura08@gmail.com`) — *Main developer*

## License

This work has been dedicated to the public domain under the **Creative Commons CC0 1.0 Universal Public Domain Dedication**. To the extent possible under law, the author has waived all copyright and related or neighboring rights.

> You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.

**© 2026 cueCode Software.**

```
                                   ______          __
                  _______  _____  / ____/___  ____/ /__
                 / ___/ / / / _ \/ /   / __ \/ __  / _ \
               / /__/ /_/ /  __/ /___/ /_/ / /_/ /  __/
                \___/\__,_/\___/\____/\____/\__,_/\___/  _____
                  / ___/____  / __/ /__      ______ _________
                  \__ \/ __ \/ /_/ __/ | /| / / __ `/ ___/ _ \
                 ___/ / /_/ / __/ /_ | |/ |/ / /_/ / /  /  __/
                /____/\____/_/  \__/ |__/|__/\__,_/_/   \___/
```
