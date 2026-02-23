const supabase = require('../config/supabase');

const getAllAccounts = async(userId) => {
    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

const createAccount = async(accountData) => {
    const { data, error } = await supabase
        .from('accounts')
        .insert([accountData])
        .select();

    if (error) throw error;
    return data[0];
};

const getTotalBalance = async(userId) => {
    const { data, error } = await supabase
        .from('accounts')
        .select('balance, is_hidden')
        .eq('user_id', userId);

    if (error) throw error;

    // Sumamos solo las cuentas que no están ocultas
    return data
        .filter(acc => !acc.is_hidden)
        .reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
};

const updateAccount = async(accountId, userId, updateData) => {
    const { data, error } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', accountId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

const deleteAccount = async(accountId, userId) => {
    const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', userId);
    if (error) throw error;
    return true;
};

module.exports = { getAllAccounts, createAccount, getTotalBalance, updateAccount, deleteAccount };