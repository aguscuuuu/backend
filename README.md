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
- [Tests funcionales](#tests-funcionales)
- [Dockerización](#dockerización)
- [Imagen en DockerHub](#imagen-en-dockerhub)
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
git clone https://github.com/aguscuu/backend.git
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

## Tests funcionales

El proyecto incluye **tests funcionales** para todos los endpoints del router de
productos (`src/routes/products-router.js`), el CRUD equivalente al `adoption.router.js`
de la consigna. Se usan **Mocha** (runner), **Chai** (aserciones), **Supertest**
(peticiones HTTP) y **Sinon** (mocks/stubs).

### Estrategia de aislamiento

- El router real se monta sobre una **app Express mínima** (`express.json()` + router +
  `errorHandler`). **No** se levanta `server.js`, ni Socket.IO, ni se abre el navegador.
- El `productManager` (única dependencia externa, que habla con MongoDB) se reemplaza con
  **stubs de Sinon**. **Ningún test toca la base de datos real** → son rápidos, deterministas
  y aislados.
- Cada endpoint se prueba en casos de **éxito**, **error del servidor (500)**,
  **no encontrado (404)**, **validación (400)** y **error de negocio (400)**.

### Cobertura por endpoint

| Endpoint | Casos probados |
| --- | --- |
| `GET /api/products` | 200 lista paginada · reenvío de query params · 500 error del manager |
| `GET /api/products/:pid` | 200 producto encontrado · 404 no encontrado |
| `POST /api/products` | 201 creado · 400 validación (no llama al manager) · 400 error de negocio |
| `PUT /api/products/:pid` | 200 actualizado · 400 validación · 400 no encontrado |
| `DELETE /api/products/:pid` | 200 eliminado · 404 no encontrado |

### Ejecutar los tests

```sh
npm install      # instala también las devDependencies (mocha, chai, sinon, supertest)
npm test
```

Salida esperada (13 tests en verde):

```
  Router de productos - /api/products
    GET /api/products
      ✔ responde 200 y la lista paginada de productos (éxito)
      ✔ reenvía los query params (limit, page, sort, query) al manager
      ✔ responde 500 si el manager lanza un error (error del servidor)
    GET /api/products/:pid
      ✔ responde 200 y el producto cuando existe (éxito)
      ✔ responde 404 cuando el producto no existe (no encontrado)
    POST /api/products
      ✔ responde 201 y crea el producto con body válido (éxito)
      ✔ responde 400 y NO llama al manager con body inválido (validación)
      ✔ responde 400 si el manager falla al crear (error de negocio)
    PUT /api/products/:pid
      ✔ responde 200 y actualiza el producto con body válido (éxito)
      ✔ responde 400 con body inválido (validación)
      ✔ responde 400 si el producto a actualizar no existe (error de negocio)
    DELETE /api/products/:pid
      ✔ responde 200 y elimina el producto cuando existe (éxito)
      ✔ responde 404 cuando el producto a eliminar no existe (no encontrado)

  13 passing (191ms)
```

---

## Dockerización

El `Dockerfile` usa **multi-stage build** sobre `node:22-alpine` para producir una imagen
pequeña, reproducible y segura.

### Decisiones de optimización

| Decisión | Motivo |
| --- | --- |
| Base `node:22-alpine` | Imagen mínima (~50 MB base) con Node LTS. |
| **Multi-stage** (`deps` → `runtime`) | La etapa final solo lleva `node_modules` de producción y el código; no arrastra cache de npm ni herramientas de build. |
| `npm ci --omit=dev` | Instala exactamente lo del `package-lock.json` y **excluye** devDependencies (mocha, chai, etc.). |
| `COPY package*.json` antes que el código | Aprovecha el **cache de capas**: si no cambian las dependencias, no se reinstala nada. |
| `.dockerignore` | Excluye `node_modules`, `.env`, `test`, `.git`, etc. → build más rápido y sin secretos. |
| `USER node` | Corre como usuario **sin privilegios** (no root). |
| `ENV NODE_ENV=production OPEN_BROWSER=false` | Evita que `server.js` intente abrir un navegador dentro del contenedor. |
| `HEALTHCHECK` | Docker monitorea la salud del contenedor contra `/api/products`. |

### Opción recomendada: `docker compose` (app + MongoDB, auto-contenido)

La forma más simple y reproducible es levantar la app **junto a un MongoDB en contenedor**,
sin depender de Atlas ni de un `.env`:

```sh
docker compose up --build      # construye y levanta app + mongo
# app disponible en http://localhost:8080
docker compose down -v         # detiene y limpia
```

Evidencia real de ejecución (`docker compose ps`):

```
NAME            IMAGE                   STATUS                   PORTS
backend-app     aguscuu/backend:1.0.0   Up 3 minutes (healthy)   0.0.0.0:8080->8080/tcp
backend-mongo   mongo:7                 Up 5 minutes (healthy)   27017/tcp
```

Prueba real de los endpoints dentro del contenedor:

```sh
$ curl http://localhost:8080/api/products
{"status":"success","payload":[],"totalPages":1,"page":1,"hasPrevPage":false,"hasNextPage":false, ...}

$ curl -X POST http://localhost:8080/api/products -H "Content-Type: application/json" \
    -d '{"title":"Teclado mecanico","description":"Switches rojos RGB","price":45000,"stock":25,"category":"perifericos"}'
{"status":"success","message":"Producto creado exitosamente.","data":{ ... "_id":"6a6104e7e40f9644d66f5ef0" ...}}
HTTP 201
```

### Opción alternativa: `docker run` con tu propia base

```sh
# 1) Construir la imagen
docker build -t aguscuu/backend:1.0.0 -t aguscuu/backend:latest .

# 2) Ejecutar apuntando a tu MongoDB (Atlas o propio)
docker run --rm -p 8080:8080 --env-file .env aguscuu/backend:1.0.0
```

> **Nota:** el contenedor necesita un `MONGO_URL` accesible. Con `docker run --env-file .env`
> apuntando a **MongoDB Atlas**, asegurate de tener tu **IP en la whitelist** de Atlas
> (Network Access). Sin base de datos alcanzable, el proceso finaliza (`fail-fast`).
> Si estás detrás de un **proxy/DNS corporativo**, usá la opción `docker compose` de arriba.

---

## Imagen en DockerHub

La imagen está **publicada y accesible públicamente** en DockerHub:

- **Repositorio:** https://hub.docker.com/r/aguscuu/backend
- **Imagen:** `aguscuu/backend`
- **Tags:** `1.0.0`, `latest`
- **Digest:** `sha256:6e1381c0ad39334ea8c26da09ed5943b4652dc68106fea3e8d72e1d877323b39`
- **Tamaño:** 284 MB

### Subir la imagen (etiquetado + push) — evidencia real

```sh
docker build -t aguscuu/backend:1.0.0 -t aguscuu/backend:latest .
docker push aguscuu/backend:1.0.0
docker push aguscuu/backend:latest
```

```
1.0.0:  digest: sha256:6e1381c0ad39334ea8c26da09ed5943b4652dc68106fea3e8d72e1d877323b39  size: 856
latest: digest: sha256:6e1381c0ad39334ea8c26da09ed5943b4652dc68106fea3e8d72e1d877323b39  size: 856
```

### Descargar y ejecutar desde DockerHub

```sh
docker pull aguscuu/backend:latest
docker run --rm -p 8080:8080 --env-file .env aguscuu/backend:latest
```

### Escaneo básico de seguridad (`docker scout quickview`) — resultado real

```
 Target             │  aguscuu/backend:1.0.0  │    1C     6H     7M     2L
 Base image         │  node:22-alpine         │    1C     4H     7M     0L
 Updated base image │  node:24-alpine         │    1C     3H     4M     2L

 Status │              Policy              │       Results
────────┼──────────────────────────────────┼───────────────────────
   v    │ Default non-root user            │       (cumple)
   v    │ No high-profile vulnerabilities  │  0C 0H 0M 0L (cumple)
   v    │ No outdated base images          │       (cumple)
```

Las vulnerabilidades detectadas provienen de dependencias de la imagen base; el escaneo
recomienda actualizar a `node:24-alpine` para reducirlas. La política de **usuario no-root**
y la de **sin vulnerabilidades de alto perfil** se cumplen.

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
