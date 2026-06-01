import { Router } from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/product-controller.js';
import { validate } from '../middlewares/validate.js';
import { productValidator } from '../middlewares/product-validator.js';

const router = Router();

router.get('/', getAllProducts);
router.get('/:pid', getProductById);
router.post('/', validate(productValidator), createProduct);
router.put('/:pid', validate(productValidator), updateProduct);
router.delete('/:pid', deleteProduct);

export { router };
