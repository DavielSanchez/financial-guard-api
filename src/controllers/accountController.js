const accountService = require('../services/accountService');

const getAccounts = async(req, res) => {
    try {
        const userId = req.user.id;
        const accounts = await accountService.getAllAccounts(userId);
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBalance = async(req, res) => {
    try {
        const userId = req.user.id;
        const total = await accountService.getTotalBalance(userId);
        res.json({ total_balance: total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addAccount = async(req, res) => {
    try {
        const accountData = {
            user_id: req.user.id,
            name: req.body.name,
            type: req.body.type || 'cash',
            balance: req.body.balance || 0,
            currency: req.body.currency || 'USD',
            icon: req.body.icon || null,
            color: req.body.color || null,
            interest_rate: req.body.interest_rate || 0,
            is_hidden: req.body.is_hidden || false
        };

        const newAccount = await accountService.createAccount(accountData);
        res.status(201).json(newAccount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const patchAccount = async(req, res) => {
    try {
        const updated = await accountService.updateAccount(req.params.id, req.user.id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeAccount = async(req, res) => {
    try {
        await accountService.deleteAccount(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const bridgeAccounts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { from_account_id, to_account_id, amount, category_id } = req.body;

        if (!from_account_id || !to_account_id || !amount) {
            return res.status(400).json({ error: "from_account_id, to_account_id y amount son requeridos." });
        }

        const result = await accountService.bridgeAccounts(userId, from_account_id, to_account_id, amount, category_id);
        res.status(200).json({ message: "Transferencia completada exitosamente", data: result });
    } catch (error) {
        // Asumiendo que errores como "monedas distintas" o "saldo insuficiente" pueden ser devueltos por el RPC
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getAccounts, getBalance, addAccount, patchAccount, removeAccount, bridgeAccounts };