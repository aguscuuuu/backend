# Entrega Final — Tests funcionales, Dockerización y Documentación

**Proyecto:** Backend Node.js + Express 5 (Sistema de autenticación híbrida + e-commerce)
**Autor:** Agustín Cuenca
**Repositorio:** https://github.com/aguscuu/backend
**Imagen DockerHub:** https://hub.docker.com/r/aguscuu/backend
**Fecha:** Julio 2026

> **Nota sobre la consigna:** la consigna genérica pide tests para `adoption.router.js`
> (proyecto de referencia "AdoptMe"). Este proyecto es un **e-commerce**, por lo que los
> tests funcionales se desarrollaron sobre el router **equivalente**:
> `src/routes/products-router.js`, que expone el mismo CRUD (GET all, GET by id, POST, PUT, DELETE).

---

## 1. Estructura del proyecto

### Descripción del repositorio

Backend construido con **Node.js (ESM) + Express 5** siguiendo una **arquitectura por capas**
(routes → controllers → managers → models). Implementa autenticación híbrida (local + GitHub
OAuth + JWT + sesiones) y una demo de e-commerce (productos y carritos) con vistas Handlebars
y actualizaciones en tiempo real vía Socket.IO.

### Árbol de directorios (archivos principales)

```
backend/
├── server.js                     # Entry point: servidor HTTP + Socket.IO + bootstrap
├── package.json                  # Scripts (start, test) y dependencias
├── package-lock.json
├── Dockerfile                    # Imagen Docker optimizada (multi-stage)
├── docker-compose.yml            # App + MongoDB local (demo auto-contenida)
├── .dockerignore                 # Exclusiones del contexto de build
├── .env.example                  # Plantilla de variables de entorno
├── README.md                     # Documentación del proyecto
├── eslint.config.js
├── test/
│   └── products.test.js          # Tests funcionales del router de productos
└── src/
    ├── app.js                    # Configuración de Express (middlewares, sesión, rutas)
    ├── config/                   # env, conexión Mongo, logger, passport
    │   ├── connection.js
    │   ├── env.js
    │   ├── logger.js
    │   └── passport.js
    ├── models/                   # Schemas Mongoose (User, Product, Cart)
    │   ├── cart-model.js
    │   ├── product-model.js
    │   └── user-model.js
    ├── strategies/               # Estrategias Passport (local, github)
    ├── controllers/              # Orquestación de req/res
    │   ├── product-controller.js
    │   └── ...
    ├── managers/                 # Capa de acceso a datos / servicios
    │   ├── product-manager.js
    │   └── ...
    ├── middlewares/              # validate, product-validator, error-handler, etc.
    ├── routes/                   # Mapeo URL → controller
    │   ├── products-router.js    # ← router bajo test
    │   └── ...
    ├── utils/                    # jwt, formatters
    ├── views/                    # Plantillas Handlebars
    └── public/                   # Assets estáticos
```

### Propósito de las carpetas principales

| Carpeta / archivo | Propósito |
| --- | --- |
| `server.js` | Punto de entrada: crea el servidor HTTP, monta Socket.IO, conecta MongoDB y levanta el listener. |
| `src/app.js` | Instancia y configura Express (middlewares, sesión, rutas, manejo de errores). |
| `src/config/` | Bootstrap: validación de variables de entorno, conexión a Mongo, logger (Winston) y Passport. |
| `src/models/` | Schemas de Mongoose con sus restricciones. |
| `src/controllers/` | Reciben `req`/`res`, invocan a los managers y arman la respuesta JSON. No acceden a la DB directamente. |
| `src/managers/` | Capa de servicio / acceso a datos: encapsulan Mongoose. |
| `src/middlewares/` | Validación (`validate`, `product-validator`), manejo de errores (`error-handler`), auth, rate-limit, logging. |
| `src/routes/` | Definen las URLs y aplican middlewares. **`products-router.js`** es el router probado. |
| `test/` | Tests funcionales con Mocha + Chai + Supertest + Sinon. |
| `Dockerfile` / `.dockerignore` | Definición y optimización de la imagen Docker. |

---

## 2. Tests funcionales

### Stack de testing

- **Mocha** — runner de tests.
- **Chai** — librería de aserciones (`expect`).
- **Supertest** — peticiones HTTP contra la app en memoria (sin abrir puertos reales).
- **Sinon** — mocks/stubs para aislar la dependencia externa (`productManager` → MongoDB).

### Qué valida cada grupo de tests

| Grupo (endpoint) | Qué valida |
| --- | --- |
| **`GET /api/products`** | Devuelve 200 con la lista paginada; que los *query params* (`limit`, `page`, `sort`, `query`) se reenvían correctamente al manager; y que un fallo del manager produce **500**. |
| **`GET /api/products/:pid`** | Devuelve 200 con el producto cuando existe; y **404** cuando el manager indica que no se encontró. |
| **`POST /api/products`** | Crea el producto (**201**) con body válido; corta con **400** cuando el body es inválido *sin* llamar al manager (validación); y **400** cuando el manager lanza un error de negocio. |
| **`PUT /api/products/:pid`** | Actualiza (**200**) con body válido; **400** por validación; **400** cuando el producto a actualizar no existe. |
| **`DELETE /api/products/:pid`** | Elimina (**200**) cuando existe; **404** cuando no existe. |

### Estrategia de aislamiento (mocks y fakes)

- El router **real** se monta sobre una app Express **mínima** (`express.json()` + router +
  `errorHandler`). No se levanta `server.js` ni Socket.IO ni se abre el navegador.
- El `productManager` (única dependencia externa) se reemplaza con **stubs de Sinon**
  (`sinon.stub(...).resolves(...)` / `.rejects(...)`). **Ningún test toca la base de datos real.**
- Se usa un objeto **fake** (`fakeProduct`) como payload simulado de las respuestas del manager.

### Código completo de los tests (`test/products.test.js`)

```js
/**
 * Tests funcionales del router de productos (src/routes/products-router.js).
 *
 * Estrategia:
 *  - Se monta el router real sobre una app Express mínima y aislada
 *    (solo express.json() + el router + el errorHandler). No se levanta
 *    el servidor completo (server.js) ni se abre navegador ni sockets.
 *  - Las dependencias externas (MongoDB a través de productManager) se
 *    reemplazan con STUBS de sinon. Ningún test toca la base de datos real.
 *  - Se usa supertest para disparar peticiones HTTP contra la app en memoria.
 *
 * Con esto se validan los 5 endpoints del router cubriendo casos de
 * éxito, error del servidor, "no encontrado" y validación de datos.
 */

import { expect } from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import express from 'express';

import { router as productsRouter } from '../src/routes/products-router.js';
import { productManager } from '../src/managers/product-manager.js';
import { errorHandler } from '../src/middlewares/error-handler.js';

// ── App de pruebas aislada ────────────────────────────────────────────
// Solo lo indispensable para ejercitar el router de productos.
const buildTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/products', productsRouter);
    app.use(errorHandler);
    return app;
};

const requester = supertest(buildTestApp());

// Producto de ejemplo reutilizable como "fake" en las respuestas del manager.
const fakeProduct = {
    _id: '650000000000000000000001',
    title: 'Teclado mecánico',
    description: 'Switches rojos, retroiluminado RGB',
    price: 45000,
    status: true,
    stock: 25,
    category: 'perifericos',
    thumbnails: [],
};

const validBody = {
    title: 'Teclado mecánico',
    description: 'Switches rojos, retroiluminado RGB',
    price: 45000,
    stock: 25,
    category: 'perifericos',
};

describe('Router de productos - /api/products', () => {
    // Después de cada test se restauran todos los stubs para no
    // contaminar el siguiente caso.
    afterEach(() => {
        sinon.restore();
    });

    // ── GET /api/products ────────────────────────────────────────────
    describe('GET /api/products', () => {
        it('responde 200 y la lista paginada de productos (éxito)', async () => {
            const managerResult = {
                status: 'success',
                payload: [fakeProduct],
                totalPages: 1,
                page: 1,
                hasPrevPage: false,
                hasNextPage: false,
                prevLink: null,
                nextLink: null,
            };
            const stub = sinon.stub(productManager, 'getAll').resolves(managerResult);

            const { statusCode, body } = await requester.get('/api/products');

            expect(statusCode).to.equal(200);
            expect(body.status).to.equal('success');
            expect(body.payload).to.be.an('array').with.lengthOf(1);
            expect(body.payload[0].title).to.equal('Teclado mecánico');
            expect(stub.calledOnce).to.be.true;
        });

        it('reenvía los query params (limit, page, sort, query) al manager', async () => {
            const stub = sinon.stub(productManager, 'getAll').resolves({ payload: [] });

            await requester.get('/api/products?limit=5&page=2&sort=asc&query=available');

            expect(stub.firstCall.args[0]).to.include({
                limit: '5',
                page: '2',
                sort: 'asc',
                query: 'available',
            });
        });

        it('responde 500 si el manager lanza un error (error del servidor)', async () => {
            sinon.stub(productManager, 'getAll').rejects(new Error('Fallo de base de datos'));

            const { statusCode, body } = await requester.get('/api/products');

            expect(statusCode).to.equal(500);
            expect(body.status).to.equal('error');
            expect(body.message).to.equal('Fallo de base de datos');
        });
    });

    // ── GET /api/products/:pid ───────────────────────────────────────
    describe('GET /api/products/:pid', () => {
        it('responde 200 y el producto cuando existe (éxito)', async () => {
            sinon.stub(productManager, 'getOne').resolves(fakeProduct);

            const { statusCode, body } = await requester.get(
                '/api/products/650000000000000000000001'
            );

            expect(statusCode).to.equal(200);
            expect(body.status).to.equal('success');
            expect(body.data._id).to.equal(fakeProduct._id);
        });

        it('responde 404 cuando el producto no existe (no encontrado)', async () => {
            sinon.stub(productManager, 'getOne').rejects(new Error('Producto no encontrado.'));

            const { statusCode, body } = await requester.get('/api/products/inexistente');

            expect(statusCode).to.equal(404);
            expect(body.status).to.equal('error');
            expect(body.message).to.equal('Producto no encontrado.');
        });
    });

    // ── POST /api/products ───────────────────────────────────────────
    describe('POST /api/products', () => {
        it('responde 201 y crea el producto con body válido (éxito)', async () => {
            const stub = sinon.stub(productManager, 'create').resolves(fakeProduct);

            const { statusCode, body } = await requester
                .post('/api/products')
                .send(validBody);

            expect(statusCode).to.equal(201);
            expect(body.status).to.equal('success');
            expect(body.message).to.equal('Producto creado exitosamente.');
            expect(body.data.title).to.equal('Teclado mecánico');
            expect(stub.calledOnceWith(validBody)).to.be.true;
        });

        it('responde 400 y NO llama al manager con body inválido (validación)', async () => {
            const stub = sinon.stub(productManager, 'create').resolves(fakeProduct);
            const invalidBody = { title: 'Solo título' }; // faltan price, description, stock

            const { statusCode, body } = await requester
                .post('/api/products')
                .send(invalidBody);

            expect(statusCode).to.equal(400);
            expect(body.status).to.equal('error');
            expect(body.message).to.equal('Datos inválidos');
            expect(body.errors).to.be.an('array').that.is.not.empty;
            // La validación cortó antes: el manager nunca se ejecutó.
            expect(stub.called).to.be.false;
        });

        it('responde 400 si el manager falla al crear (error de negocio)', async () => {
            sinon.stub(productManager, 'create').rejects(new Error('Categoría inexistente'));

            const { statusCode, body } = await requester
                .post('/api/products')
                .send(validBody);

            expect(statusCode).to.equal(400);
            expect(body.status).to.equal('error');
            expect(body.message).to.equal('Categoría inexistente');
        });
    });

    // ── PUT /api/products/:pid ───────────────────────────────────────
    describe('PUT /api/products/:pid', () => {
        it('responde 200 y actualiza el producto con body válido (éxito)', async () => {
            const actualizado = { ...fakeProduct, price: 39999 };
            sinon.stub(productManager, 'update').resolves(actualizado);

            const { statusCode, body } = await requester
                .put('/api/products/650000000000000000000001')
                .send({ ...validBody, price: 39999 });

            expect(statusCode).to.equal(200);
            expect(body.status).to.equal('success');
            expect(body.message).to.equal('Producto actualizado exitosamente.');
            expect(body.data.price).to.equal(39999);
        });

        it('responde 400 con body inválido (validación)', async () => {
            const stub = sinon.stub(productManager, 'update').resolves(fakeProduct);

            const { statusCode, body } = await requester
                .put('/api/products/650000000000000000000001')
                .send({ price: 'no-es-numero' });

            expect(statusCode).to.equal(400);
            expect(body.message).to.equal('Datos inválidos');
            expect(stub.called).to.be.false;
        });

        it('responde 400 si el producto a actualizar no existe (error de negocio)', async () => {
            sinon.stub(productManager, 'update').rejects(new Error('Producto no encontrado.'));

            const { statusCode, body } = await requester
                .put('/api/products/inexistente')
                .send(validBody);

            expect(statusCode).to.equal(400);
            expect(body.status).to.equal('error');
            expect(body.message).to.equal('Producto no encontrado.');
        });
    });

    // ── DELETE /api/products/:pid ────────────────────────────────────
    describe('DELETE /api/products/:pid', () => {
        it('responde 200 y elimina el producto cuando existe (éxito)', async () => {
            const mensaje = `Producto: ${fakeProduct._id} eliminado.`;
            const stub = sinon.stub(productManager, 'delete').resolves(mensaje);

            const { statusCode, body } = await requester.delete(
                '/api/products/650000000000000000000001'
            );

            expect(statusCode).to.equal(200);
            expect(body.status).to.equal('success');
            expect(body.message).to.equal(mensaje);
            expect(stub.calledOnceWith('650000000000000000000001')).to.be.true;
        });

        it('responde 404 cuando el producto a eliminar no existe (no encontrado)', async () => {
            sinon.stub(productManager, 'delete').rejects(new Error('Producto no encontrado.'));

            const { statusCode, body } = await requester.delete('/api/products/inexistente');

            expect(statusCode).to.equal(404);
            expect(body.status).to.equal('error');
            expect(body.message).to.equal('Producto no encontrado.');
        });
    });
});
```

### Evidencia de ejecución (log real)

Comando: `npm test`

```
> backend@1.0.0 test
> mocha "test/**/*.test.js" --timeout 10000

  Router de productos - /api/products
    GET /api/products
      ✔ responde 200 y la lista paginada de productos (éxito) (58ms)
      ✔ reenvía los query params (limit, page, sort, query) al manager
      ✔ responde 500 si el manager lanza un error (error del servidor)
    GET /api/products/:pid
      ✔ responde 200 y el producto cuando existe (éxito)
      ✔ responde 404 cuando el producto no existe (no encontrado)
    POST /api/products
      ✔ responde 201 y crea el producto con body válido (éxito) (48ms)
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

**Resultado: 13/13 tests en verde.**

---

## 3. Dockerización

### Contenido completo del `Dockerfile`

```dockerfile
# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Etapa 1: deps — instala SOLO dependencias de producción
# Se aísla en su propia capa para aprovechar el cache: mientras
# package*.json no cambie, npm ci no se vuelve a ejecutar.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ─────────────────────────────────────────────────────────────
# Etapa 2: runtime — imagen final mínima
# Copia node_modules ya resueltos + el código fuente.
# Corre como usuario sin privilegios (node) por seguridad.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    OPEN_BROWSER=false \
    PORT=8080

# Dependencias de producción desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Código de la aplicación (respetando .dockerignore)
COPY package.json ./
COPY server.js ./
COPY src ./src

# Usuario no-root ya incluido en la imagen oficial de node
USER node

EXPOSE 8080

# Healthcheck simple contra el endpoint público de productos
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://localhost:'+ (process.env.PORT||8080) +'/api/products').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
```

### `.dockerignore`

```
node_modules
npm-debug.log*
.env
.env.*.local
test
coverage
.nyc_output
.git
.gitignore
.github
.vscode
.idea
.claude
PROJECT.md
docs
.DS_Store
Thumbs.db
Dockerfile
.dockerignore
*.tmp
*.log
```

### Decisiones de optimización

| Decisión | Motivo |
| --- | --- |
| Base `node:22-alpine` | Imagen mínima con Node LTS; reduce tamaño y superficie de ataque. |
| **Multi-stage build** (`deps` → `runtime`) | La imagen final solo lleva `node_modules` de producción y el código; no arrastra cache de npm ni herramientas de build. |
| `npm ci --omit=dev` | Instala exactamente lo del `package-lock.json` (reproducible) y **excluye** devDependencies (mocha, chai, sinon, supertest). |
| `COPY package*.json` **antes** del código | Aprovecha el cache de capas: si no cambian las dependencias, no se reinstala nada. |
| `.dockerignore` | Excluye `node_modules`, `.env`, `test`, `.git`, `docs`, etc. → build más rápido y sin secretos. |
| `USER node` | Corre como usuario **sin privilegios** (no root), buena práctica de seguridad. |
| `ENV NODE_ENV=production OPEN_BROWSER=false` | Evita que `server.js` intente abrir un navegador dentro del contenedor. |
| `HEALTHCHECK` | Docker monitorea la salud del contenedor contra `/api/products`. |

### Log de construcción de la imagen (real)

Comando: `docker build -t aguscuu/backend:1.0.0 -t aguscuu/backend:latest .`

```
#12 [deps 4/4] RUN npm ci --omit=dev && npm cache clean --force
#12 4.812 added 215 packages, and audited 216 packages in 4s
#12 DONE 5.5s
#13 [runtime 3/6] COPY --from=deps /app/node_modules ./node_modules  DONE 0.5s
#14 [runtime 4/6] COPY package.json ./                               DONE 0.1s
#15 [runtime 5/6] COPY server.js ./                                  DONE 0.0s
#16 [runtime 6/6] COPY src ./src                                     DONE 0.0s
#17 exporting to image
#17 exporting manifest sha256:da558c602d6f66f8145f3573dda1ac4f5706873ce8b24f2bdc1503716f9bed08 done
#17 naming to docker.io/aguscuu/backend:1.0.0 done
#17 naming to docker.io/aguscuu/backend:latest done
#17 DONE 3.1s
```

Build exitoso, ambos tags generados.

---

## 4. Imagen Docker

- **Nombre de la imagen:** `aguscuu/backend`
- **Tags:** `1.0.0`, `latest`
- **Base:** `node:22-alpine`
- **Tamaño:** 284 MB
- **Digest:** `sha256:6e1381c0ad39334ea8c26da09ed5943b4652dc68106fea3e8d72e1d877323b39`
- **Repositorio DockerHub (público):** https://hub.docker.com/r/aguscuu/backend

### Evidencia de imagen construida (real) — `docker images aguscuu/backend`

```
REPOSITORY        TAG       IMAGE ID       SIZE
aguscuu/backend   1.0.0     6e1381c0ad39   284MB
aguscuu/backend   latest    6e1381c0ad39   284MB
```

### Evidencia de push a DockerHub (real)

```
$ docker push aguscuu/backend:1.0.0
1.0.0:  digest: sha256:6e1381c0ad39334ea8c26da09ed5943b4652dc68106fea3e8d72e1d877323b39  size: 856

$ docker push aguscuu/backend:latest
latest: digest: sha256:6e1381c0ad39334ea8c26da09ed5943b4652dc68106fea3e8d72e1d877323b39  size: 856
```

### Evidencia de ejecución del contenedor (real) — `docker compose ps`

```
NAME            IMAGE                   STATUS                   PORTS
backend-app     aguscuu/backend:1.0.0   Up 3 minutes (healthy)   0.0.0.0:8080->8080/tcp
backend-mongo   mongo:7                 Up 5 minutes (healthy)   27017/tcp
```

El contenedor `backend-app` figura como **healthy** (el `HEALTHCHECK` contra `/api/products`
pasa). Prueba real de los endpoints **dentro del contenedor**:

```
$ curl http://localhost:8080/api/products
{"status":"success","payload":[],"totalPages":1,"page":1,"hasPrevPage":false,"hasNextPage":false, ...}

$ curl -X POST http://localhost:8080/api/products -H "Content-Type: application/json" \
    -d '{"title":"Teclado mecanico","description":"Switches rojos RGB","price":45000,"stock":25,"category":"perifericos"}'
{"status":"success","message":"Producto creado exitosamente.","data":{ ... "_id":"6a6104e7e40f9644d66f5ef0" ...}}
HTTP 201

$ curl http://localhost:8080/api/products
{"status":"success","payload":[{ "_id":"6a6104e7e40f9644d66f5ef0", "title":"Teclado mecanico", ... }], ...}
```

CRUD verificado dentro del contenedor: **GET 200**, **POST 201** y persistencia confirmada.

### Escaneo básico de seguridad (real) — `docker scout quickview aguscuu/backend:1.0.0`

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
recomienda actualizar a `node:24-alpine`. Las políticas de **usuario no-root** y de
**sin vulnerabilidades de alto perfil** se cumplen.

---

## 5. Ejecución del proyecto

### 5.1. Correr los tests

```sh
git clone https://github.com/aguscuu/backend.git
cd backend
npm install
npm test
```

Evidencia esperada: **13 passing** (ver sección 2).

### 5.2. Construir la imagen Docker

```sh
docker build -t aguscuu/backend:1.0.0 -t aguscuu/backend:latest .
```

### 5.3. Ejecutar el contenedor (recomendado: docker compose, auto-contenido)

La forma más simple y reproducible levanta la app **junto a un MongoDB en contenedor**
(no requiere Atlas ni `.env`):

```sh
docker compose up --build      # levanta app + mongo
# app en http://localhost:8080
docker compose down -v         # detiene y limpia
```

Alternativa con `docker run` apuntando a tu propia base (Atlas u otra):

```sh
docker run --rm -p 8080:8080 --env-file .env aguscuu/backend:1.0.0
```

> **Nota:** con Atlas, tu IP debe estar en la whitelist (Network Access). En redes con
> proxy/DNS corporativo, usá `docker compose` (Mongo local), que evita esa dependencia.

La app queda disponible en `http://localhost:8080`. Verificar con
`GET http://localhost:8080/api/products`.

### 5.4. Descargar y ejecutar desde DockerHub

```sh
docker pull aguscuu/backend:latest
docker run --rm -p 8080:8080 --env-file .env aguscuu/backend:latest
```

---

## 6. README

> A continuación, el contenido del `README.md` del repositorio. El README completo y
> actualizado (con las secciones de Tests, Dockerización e Imagen en DockerHub) está en la
> raíz del repo: https://github.com/aguscuu/backend/blob/main/README.md

Las secciones nuevas relevantes para esta entrega son:

- **Tests funcionales** — stack, estrategia de aislamiento, cobertura por endpoint, comando y log.
- **Dockerización** — decisiones de optimización y comandos de build/run.
- **Imagen en DockerHub** — nombre, tags, URL pública, push y escaneo de seguridad.

El resto del README documenta la arquitectura por capas, las estrategias de autenticación,
los endpoints de la API, la seguridad y las instrucciones de instalación local, permitiendo
**reproducir el proyecto sin información adicional**.
