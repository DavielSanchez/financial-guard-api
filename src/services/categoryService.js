const supabase = require('../config/supabase');

const categoryService = {
    getAll: async(userId) => {
        if (!userId) {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .is('user_id', null)
                .order('name', { ascending: true });
            if (error) throw error;
            return data;
        }

        // Usamos el filtro .or con la sintaxis de filtros crudos de PostgREST
        // Es vital que no haya espacios después de las comas
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .or(`user_id.is.null,user_id.eq.${userId}`) // <--- Sin espacios, sintaxis estricta
            .order('name', { ascending: true });

        if (error) {
            console.error("Error en or-filter:", error.message);
            throw error;
        }

        return data;
    },

    create: async(userId, categoryData) => {
        const { data, error } = await supabase
            .from('categories')
            .insert([{...categoryData, user_id: userId }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    delete: async(categoryId, userId) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId)
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    }
};

module.exports = categoryService;