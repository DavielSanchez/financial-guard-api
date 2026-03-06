const supabase = require('../config/supabase');

const createTransaction = async(userId, txData) => {
    // Forzamos el userId del token
    const payload = {...txData, user_id: userId };

    // 1. Insertar la transacción
    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert([payload])
        .select()
        .single();

    if (txError) throw txError;

    // 2. Ajustar el balance vía RPC (mantenemos tu lógica de base de datos)
    const adjustment = payload.type === 'expense' ? -payload.amount : payload.amount;

    const { error: accError } = await supabase.rpc('adjust_account_balance', {
        account_id_param: payload.account_id,
        amount_param: adjustment
    });

    if (accError) console.error("Error al actualizar balance:", accError);

    return transaction;
};

const getTransactions = async(userId, filters = {}) => {
    let query = supabase
        .from('transactions')
        .select(`
            *,
            categories (name, icon, color),
            accounts (name)
        `, { count: 'exact' })
        .eq('user_id', userId);

    // Filtros inteligentes
    if (filters.startDate) query = query.gte('date', filters.startDate);
    if (filters.endDate) query = query.lte('date', filters.endDate);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.accountId) query = query.eq('account_id', filters.accountId);
    if (filters.categoryId) query = query.eq('category_id', filters.categoryId);

    // Paginación
    const limit = filters.limit ? parseInt(filters.limit) : 20;
    const page = filters.page ? parseInt(filters.page) : 1;
    const offset = (page - 1) * limit;

    const { data, error, count } = await query
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    return {
        transactions: data || [],
        pagination: {
            total: count || 0,
            page,
            totalPages,
            hasMore
        }
    };
};

const deleteTransaction = async(transactionId, userId) => {
    // 1. Obtener la transacción para saber qué revertir
    const { data: tx, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', userId)
        .single();

    if (fetchError || !tx) throw new Error("Transacción no encontrada");

    // 2. Revertir balance (Lógica inversa: si fue gasto, devolvemos dinero)
    const reverseAmount = tx.type === 'expense' ? tx.amount : -tx.amount;

    await supabase.rpc('adjust_account_balance', {
        account_id_param: tx.account_id,
        amount_param: reverseAmount
    });

    // 3. Eliminar físicamente
    const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

    if (deleteError) throw deleteError;
    return true;
};

const getRecentTransactions = async (userId) => {
    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            categories:category_id (name, icon, color),
            accounts:account_id (name)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5);

    if (error) throw error;
    return data;
};

module.exports = { createTransaction, getTransactions, deleteTransaction, getRecentTransactions };