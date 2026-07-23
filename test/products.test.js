/**
 * tests funcionales del router de productos (src/routes/products-router.js).
 *
 * estrategia:
 *  - se monta el router real sobre una app express mínima y aislada
 *    (solo express.json() + el router + el errorhandler). no se levanta
 *    el servidor completo (server.js) ni se abre navegador ni sockets.
 *  - las dependencias externas (mongodb a través de productmanager) se
 *    reemplazan con stubs de sinon. ningún test toca la base de datos real.
 *  - se usa supertest para disparar peticiones http contra la app en memoria.
 *
 * con esto se validan los 5 endpoints del router cubriendo casos de
 * éxito, error del servidor, "no encontrado" y validación de datos.
 */

import { expect } from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import express from 'express';

import { router as productsRouter } from '../src/routes/products-router.js';
import { productManager } from '../src/managers/product-manager.js';
import { errorHandler } from '../src/middlewares/error-handler.js';

// ── app de pruebas aislada ────────────────────────────────────────────
// solo lo indispensable para ejercitar el router de productos.
const buildTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/products', productsRouter);
    app.use(errorHandler);
    return app;
};

const requester = supertest(buildTestApp());

// producto de ejemplo reutilizable como "fake" en las respuestas del manager.
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
    // después de cada test se restauran todos los stubs para no
    // contaminar el siguiente caso.
    afterEach(() => {
        sinon.restore();
    });

    // ── get /api/products ────────────────────────────────────────────
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

    // ── get /api/products/:pid ───────────────────────────────────────
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

    // ── post /api/products ───────────────────────────────────────────
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
            // la validación cortó antes: el manager nunca se ejecutó.
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

    // ── put /api/products/:pid ───────────────────────────────────────
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

    // ── delete /api/products/:pid ────────────────────────────────────
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
