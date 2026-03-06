const supabase = require('../config/supabase');

const upsertTemplate = async (userId, categoryId, budgetAmount) => {
    // Attempt an upsert which requires a unique constraint on (user_id, category_id) or (id)
    // If there is no unique constraint on (user_id, category_id), this will insert duplicates.
    // To be perfectly safe, we'll check first, then update or insert.

    const { data: existing, error: checkError } = await supabase
        .from('budget_templates')
        .select('id')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .single();
        
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means 0 rows implicitly for single()
        throw checkError;
    }

    if (existing) {
        // Update
        const { data, error } = await supabase
            .from('budget_templates')
            .update({ budget_amount: budgetAmount })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        // Insert
        const { data, error } = await supabase
            .from('budget_templates')
            .insert([{ user_id: userId, category_id: categoryId, budget_amount: budgetAmount }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

module.exports = {
    upsertTemplate
};
