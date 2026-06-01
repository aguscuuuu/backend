/**
 * Factory de middleware de validación.
 * Recibe una función validadora que acepta req.body y devuelve
 * un array de strings con los errores encontrados (vacío = válido).
 *
 * Uso: router.post('/', validate(miValidator), controlador)
 */
export const validate = (validatorFn) => (req, res, next) => {
    const errors = validatorFn(req.body);
    if (errors.length > 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Datos inválidos',
            errors,
        });
    }
    next();
};
