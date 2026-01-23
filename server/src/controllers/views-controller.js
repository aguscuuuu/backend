import { productManager } from "../managers/product-manager.js";
import { cartManager } from "../managers/cart-manager.js";

//* formatear número a pesos argentinos
const formatARS = (value) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(value);
};

//* vista de productos con paginación
export const getProductsView = async (req, res) => {
    try {
        const result = await productManager.getAll(req.query);

        const productsFormatted = result.payload.map(p => ({
            ...p,
            priceFormatted: p.price.toLocaleString('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 2
            })
        }));

        res.render('products', {
            title: 'Productos',
            products: productsFormatted,
            page: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.prevLink,
            nextLink: result.nextLink
        });
    } catch (error) {
        res.status(500).send('Error al cargar productos.');
    }
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
            product
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
            total: formatARS(total)
        });
    } catch (error) {
        res.status(404).send('Carrito no encontrado.');
    }
};
