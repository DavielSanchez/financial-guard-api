const supabase = require('../config/supabase');

const goalService = {
    createGoal: async(userId, goalData) => {
        const { data, error } = await supabase
            .from('goals')
            .insert([{...goalData, user_id: userId }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    getGoals: async(userId) => {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // Lógica de "Tachar el día" (Aporte a la meta)
    contributeToGoal: async(goalId, userId, amount) => {
        // 1. Obtenemos la meta actual
        const { data: goal, error: fError } = await supabase
            .from('goals')
            .select('*')
            .eq('id', goalId)
            .eq('user_id', userId)
            .single();

        if (fError || !goal) throw new Error("Meta no encontrada");

        // 2. Calculamos nuevo ahorro y actualizamos fecha de contribución
        const newSaved = parseFloat(goal.saved_already) + parseFloat(amount);
        const today = new Date().toISOString().split('T')[0];

        const { data: updatedGoal, error: uError } = await supabase
            .from('goals')
            .update({
                saved_already: newSaved,
                last_contribution_date: today,
                status: newSaved >= goal.target_amount ? 'completed' : 'active'
            })
            .eq('id', goalId)
            .select()
            .single();

        if (uError) throw uError;
        return updatedGoal;
    },

    deleteGoal: async(goalId, userId) => {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', goalId)
            .eq('user_id', userId);
        if (error) throw error;
        return true;
    }
};

module.exports = goalService;