const supabase = require('../config/supabase');
const { startOfMonth, endOfMonth, parseISO } = require('date-fns');

const getEnvelopes = async (userId, month, year) => {
    // Default to current month/year if not provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1; // 1-12
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Calculate start and end dates for the target month
    const targetDate = new Date(targetYear, targetMonth - 1, 1);
    const startDate = startOfMonth(targetDate).toISOString();
    const endDate = endOfMonth(targetDate).toISOString();

    // 1. Fetch envelopes for the user and period
    const { data: envelopes, error: envError } = await supabase
        .from('budget_envelopes')
        .select(`
            id,
            budget_amount,
            period_month,
            period_year,
            categories:category_id (id, name, icon, color)
        `)
        .eq('user_id', userId)
        .eq('period_month', targetMonth)
        .eq('period_year', targetYear);

    if (envError) throw envError;

    if (!envelopes || envelopes.length === 0) {
        return [];
    }

    // 2. Fetch expenses for the user in the target month to calculate 'spent'
    // We only need expenses that match the categories in the envelopes
    const categoryIds = envelopes.map(e => e.categories.id);
    
    // Fallback if there are no categories 
    if(categoryIds.length === 0) return envelopes;

    const { data: expenses, error: expError } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate)
        .in('category_id', categoryIds);

    if (expError) throw expError;

    // 3. Calculate spent per envelope
    const expensesByCategory = (expenses || []).reduce((acc, exp) => {
        acc[exp.category_id] = (acc[exp.category_id] || 0) + Number(exp.amount);
        return acc;
    }, {});

    // 4. Map final response
    return envelopes.map(env => ({
        id: env.id,
        budget_amount: env.budget_amount,
        spent: expensesByCategory[env.categories.id] || 0,
        period_month: env.period_month,
        period_year: env.period_year,
        category: env.categories
    }));
};

const createEnvelope = async (userId, data) => {
    // Unique constraint on (user_id, category_id, period_month, period_year) should ideally be handled at DB level.
    // We add a manual check here to be safe and return a clean error if needed.
    const { data: existing, error: checkError } = await supabase
        .from('budget_envelopes')
        .select('id')
        .eq('user_id', userId)
        .eq('category_id', data.category_id)
        .eq('period_month', data.period_month)
        .eq('period_year', data.period_year)
        .single();
        
    if (existing) {
        throw new Error('Ya existe un sobre para esta categoría en el mes y año especificados.');
    }

    const payload = { ...data, user_id: userId };
    const { data: newEnvelope, error } = await supabase
        .from('budget_envelopes')
        .insert([payload])
        .select()
        .single();

    if (error) throw error;
    return newEnvelope;
};

const updateEnvelope = async (id, userId, updates) => {
    const { data, error } = await supabase
        .from('budget_envelopes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

const deleteEnvelope = async (id, userId) => {
    const { error } = await supabase
        .from('budget_envelopes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    if (error) throw error;
    return true;
};

module.exports = {
    getEnvelopes,
    createEnvelope,
    updateEnvelope,
    deleteEnvelope
};
