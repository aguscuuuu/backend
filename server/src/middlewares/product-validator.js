export const productValidator = (req, res, next) => {
    const { name, price, description, stock } = req.body;
    if (!name || typeof name !== "string")
        return res.status(400).json({ error: "Nombre debe ser un string." });
    if (!price || typeof price !== "number")
        return res.status(400).json({ error: "Precio debe ser un número." });
    if (!description || typeof description !== "string")
        return res.status(400).json({ error: "Descripción debe ser un string" });
    if (!stock || typeof stock !== "number")
        return res.status(400).json({ error: "Stock debe ser un número" });
    if (!name || !price || !description || !stock)
        return res.status(400).json({ error: "Nombre, precio, stock y descripción son requeridos." });
    return next();
};
