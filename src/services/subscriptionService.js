const supabase = require('../config/supabase');

const getSubscriptions = async (userId) => {
    const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('next_bill_date', { ascending: true });

    if (error) throw error;

    let totalMonthlyDrain = 0;

    // Normalizing logic to get monthly equivalent value
    const processedSubs = (subscriptions || []).map(sub => {
        let normalizedAmount = Number(sub.amount);
        
        switch (sub.billing_cycle) {
            case 'monthly':
                break;
            case 'yearly':
                normalizedAmount = normalizedAmount / 12;
                break;
            case 'weekly':
                normalizedAmount = normalizedAmount * 4.33; // Approx weeks per month
                break;
            case 'daily':
                normalizedAmount = normalizedAmount * 30.44; // Approx days per month
                break;
            default:
                break;
        }

        if (sub.is_active) {
            totalMonthlyDrain += normalizedAmount;
        }

        return {
            ...sub,
            normalized_monthly: normalizedAmount // Return the relative equivalent
        };
    });

    return {
        total_monthly_drain: totalMonthlyDrain,
        subscriptions: processedSubs
    };
};

const createSubscription = async (userId, data) => {
    const payload = { ...data, user_id: userId };
    
    // Set default if not provided
    if(payload.is_active === undefined) payload.is_active = true;

    const { data: newSubscription, error } = await supabase
        .from('subscriptions')
        .insert([payload])
        .select()
        .single();

    if (error) throw error;
    return newSubscription;
};

const updateSubscription = async (id, userId, updates) => {
    const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

const deleteSubscription = async (id, userId) => {
    const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    if (error) throw error;
    return true;
};

module.exports = {
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription
};
