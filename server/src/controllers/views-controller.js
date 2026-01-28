import { productManager } from "../managers/product-manager.js";
import { cartManager } from "../managers/cart-manager.js";

const formatARS = (value) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(value);
};

//* página principal
export const getHomeView = async (req, res) => {
    try {
        const result = await productManager.getAll(req.query);

        const productsFormatted = result.payload.map(p => ({
            ...p,
            priceFormatted: formatARS(p.price)
        }));

        res.render('home', {
            title: 'Inicio',
            products: productsFormatted,
            page: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.prevLink?.replace('/products', ''),
            nextLink: result.nextLink?.replace('/products', ''),
            user: req.session?.user || null
        });
    } catch (error) {
        res.status(500).send('Error al cargar productos.');
    }
};

//* panel de administración (admin)
export const getRealTimeProductsView = (req, res) => {
    // Verificar que el usuario sea admin
    if (!req.session?.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Acceso denegado. Solo administradores.');
    }

    res.render('realTimeProducts', {
        title: 'Panel de Administración',
        user: req.session.user
    });
};

//* vista de detalle de producto
export const getProductDetailView = async (req, res) => {
    try {
        const { pid } = req.params;
        const productDoc = await productManager.getOne(pid);
        const product = productDoc.toObject();

        product.priceFormatted = formatARS(product.price);

        res.render('productDetail', {
            title: product.title,
            product,
            user: req.session?.user || null
        });
    } catch (error) {
        res.status(404).send('Producto no encontrado.');
    }
};

//* vista del carrito
export const getCartView = async (req, res) => {
    try {
        const { cid } = req.params;
        const cartDoc = await cartManager.getOne(cid);
        const cart = cartDoc.toObject();

        let total = 0;

        cart.products = cart.products.map(item => {
            const subtotal = item.product.price * item.quantity;
            total += subtotal;

            return {
                ...item,
                subtotalFormatted: formatARS(subtotal),
                product: {
                    ...item.product,
                    priceFormatted: formatARS(item.product.price)
                }
            };
        });

        res.render('cart', {
            title: 'Mi Carrito',
            cart,
            total: formatARS(total),
            user: req.session?.user || null
        });
    } catch (error) {
        res.status(404).send('Carrito no encontrado.');
    }
};