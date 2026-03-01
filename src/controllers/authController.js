const supabase = require('../config/supabase');

const formatUserData = (authUser, profileData, settingsData) => ({
    id: authUser.id,
    email: authUser.email,
    profile: {
        firstName: profileData?.first_name || '',
        lastName: profileData?.last_name || '',
        fullName: `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim(),
        avatar: profileData?.avatar_url || null,
    },
    settings: {
        mode: settingsData?.mode || 'dark',
        theme: settingsData?.theme || 'Neon',
        language: settingsData?.language || 'es',
        currency: settingsData?.currency || 'USD',
    },
    onboardingCompleted: profileData?.onboarding_completed || false,
    lastSignIn: authUser.last_sign_in_at
});

const register = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { 
                data: { 
                    first_name: firstName, 
                    last_name: lastName 
                } 
            }
        });

        if (error) return res.status(400).json({ error: error });
        
        res.status(201).json({ 
            message: "Registro exitoso. Revisa tu email.",
            user: data.user ? { id: data.user.id, email: data.user.email } : null 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return res.status(401).json({ message: error.message });

        const token = data.session.access_token;

        const { data: userData, error: dbError } = await supabase
            .from('profiles')
            .select(`*, user_settings(*)`)
            .eq('id', data.user.id)
            .single();

        if (dbError) return res.status(500).json({ error: "Error al obtener perfil" });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            domain: '.davielsanchez.com',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: '/'
        });

        res.json({
            message: "Login exitoso",
            user: formatUserData(data.user, userData, userData.user_settings)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMe = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No hay sesión activa" });

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return res.status(401).json({ error: "Token inválido" });

        const { data: userData, error: dbError } = await supabase
            .from('profiles')
            .select(`*, user_settings(*)`)
            .eq('id', user.id)
            .single();

        if (dbError) return res.status(500).json({ error: "Error al recuperar datos extendidos" });

        res.json(formatUserData(user, userData, userData.user_settings));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Sesión cerrada" });
};

const completeOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: "Error al actualizar el estado del onboarding" });
        }

        res.status(200).json({
            message: "Onboarding completado exitosamente",
            profile: data
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login, logout, getMe, completeOnboarding };