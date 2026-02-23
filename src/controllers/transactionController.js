const transactionService = require('../services/transactionService');

const addTransaction = async(req, res) => {
    try {
        const txData = {
            user_id: req.user.id,
            account_id: req.body.account_id,
            category_id: req.body.category_id,
            amount: req.body.amount,
            type: req.body.type,
            currency: req.body.currency || 'DOP',
            note: req.body.note || req.body.description || '',
            date: req.body.date || new Date().toISOString(),
            is_recurring: req.body.is_recurring || false,
            receipt_url: req.body.receipt_url || null
        };

        const tx = await transactionService.createTransaction(req.user.id, txData);
        res.status(201).json(tx);
    } catch (error) {
        console.error("Fallo en la DB:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const getHistory = async(req, res) => {
    try {
        // Extraemos filtros de la query: ?startDate=...&type=expense
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            type: req.query.type,
            accountId: req.query.accountId,
            limit: req.query.limit || 20
        };

        const history = await transactionService.getTransactions(req.user.id, filters);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeTransaction = async(req, res) => {
    try {
        await transactionService.deleteTransaction(req.params.id, req.user.id);
        res.status(200).json({ message: "Transacción eliminada y balance ajustado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addTransaction, getHistory, removeTransaction };