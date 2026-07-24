import { productManager } from '../managers/product-manager.js';
import { cartManager } from '../managers/cart-manager.js';
import { formatARS } from '../utils/formatters.js';

export const getHomeView = async (req, res, next) => {
    try {
        const result = await productManager.getAll(req.query);

        const productsFormatted = result.payload.map((p) => {
            const hasDiscount = p.oldPrice && p.oldPrice > p.price;
            return {
                ...p,
                priceFormatted: formatARS(p.price),
                oldPriceFormatted: hasDiscount ? formatARS(p.oldPrice) : null,
                discountPercent: hasDiscount
                    ? Math.round((1 - p.price / p.oldPrice) * 100)
                    : null,
            };
        });

        res.render('home', {
            title: 'Vertex',
            products: productsFormatted,
            page: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.prevLink?.replace('/products', ''),
            nextLink: result.nextLink?.replace('/products', ''),
            user: req.session?.user || null,
        });
    } catch (error) {
        next(error);
    }
};

export const getRealTimeProductsView = (req, res) => {
    if (!req.session?.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Acceso denegado. Solo administradores.');
    }

    res.render('realTimeProducts', {
        title: 'Panel de Administración',
        user: req.session.user,
    });
};

export const getProductDetailView = async (req, res, next) => {
    try {
        const { pid } = req.params;
        const productDoc = await productManager.getOne(pid);
        const product = productDoc.toObject();

        product.priceFormatted = formatARS(product.price);
        product.hasGallery = Array.isArray(product.thumbnails) && product.thumbnails.length > 1;
        const hasDiscount = product.oldPrice && product.oldPrice > product.price;
        product.oldPriceFormatted = hasDiscount ? formatARS(product.oldPrice) : null;
        product.discountPercent = hasDiscount
            ? Math.round((1 - product.price / product.oldPrice) * 100)
            : null;

        res.render('productDetail', {
            title: product.title,
            product,
            user: req.session?.user || null,
        });
    } catch (error) {
        error.status = 404;
        next(error);
    }
};

export const getCartView = async (req, res, next) => {
    try {
        const { cid } = req.params;
        const cartDoc = await cartManager.getOne(cid);
        const cart = cartDoc.toObject();

        let total = 0;

        cart.products = cart.products.map((item) => {
            const subtotal = item.product.price * item.quantity;
            total += subtotal;

            return {
                ...item,
                subtotalFormatted: formatARS(subtotal),
                product: {
                    ...item.product,
                    priceFormatted: formatARS(item.product.price),
                },
            };
        });

        res.render('cart', {
            title: 'Mi Carrito',
            cart,
            total: formatARS(total),
            user: req.session?.user || null,
        });
    } catch (error) {
        error.status = 404;
        next(error);
    }
};
