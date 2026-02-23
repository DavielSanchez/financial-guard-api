const supabase = require('../config/supabase');

const authenticate = async(req, res, next) => {
    // Extraemos el token directamente de las cookies
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No hay sesión activa.' });
    }

    try {
        // Validamos el token con Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Sesión inválida o expirada.' });
        }

        // Guardamos el usuario en la request para usarlo en los controladores
        req.user = user;
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Error interno en la autenticación.' });
    }
};

module.exports = authenticate;