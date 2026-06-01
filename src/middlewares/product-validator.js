/**
 * Valida el body de creación/actualización de producto.
 * Devuelve un array de strings con los errores (vacío = válido).
 * Diseñado para usarse con el middleware validate() de validate.js.
 */
export const productValidator = (body) => {
    const errors = [];
    const { title, price, description, stock } = body;

    if (!title || typeof title !== 'string')
        errors.push('title debe ser un string no vacío');
    if (price === undefined || typeof price !== 'number')
        errors.push('price debe ser un número');
    if (!description || typeof description !== 'string')
        errors.push('description debe ser un string no vacío');
    if (stock === undefined || typeof stock !== 'number')
        errors.push('stock debe ser un número');

    return errors;
};
