import { productManager } from "../managers/product-manager.js";
import { cartManager } from "../managers/cart-manager.js";

//* vista de productos con paginación
export const getProductsView = async (req, res) => {
    try {
        const result = await productManager.getAll(req.query);
        
        res.render('products', {
            title: 'Productos',
            products: result.payload,
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
        const product = await productManager.getOne(pid);
        
        res.render('productDetail', {
            title: product.title,
            product: product.toObject() 
        });
    } catch (error) {
        res.status(404).send('Producto no encontrado.');
    }
};

//* vista del carrito
export const getCartView = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getOne(cid);
        
        // calcular total
        const total = cart.products.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);
        
        res.render('cart', {
            title: 'Mi Carrito',
            cart: cart.toObject(), 
            total
        });
    } catch (error) {
        res.status(404).send('Carrito no encontrado.');
    }
};