export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

export const isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        // redirigir según el rol
        if (req.session.user.isAdmin) {
            return res.redirect('/realtimeproducts');
        }
        return res.redirect('/');
    }
    next();
};

// verificar que no sea admin
export const isNotAdmin = (req, res, next) => {
    if (req.session?.user?.isAdmin) {
        return res.redirect('/realtimeproducts');
    }
    next();
};