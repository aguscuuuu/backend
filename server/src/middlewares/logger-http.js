export const loggerHttp = (req, res, next) => {
    console.log(`[${req.method.toUpperCase()}] - ${req.url} - ${new Date().toISOString()}`);
    next();
}