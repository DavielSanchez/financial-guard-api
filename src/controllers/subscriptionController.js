const subscriptionService = require('../services/subscriptionService');

const getSubscriptions = async (req, res) => {
    try {
        const result = await subscriptionService.getSubscriptions(req.user.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createSubscription = async (req, res) => {
    try {
        const subPayload = {
            name: req.body.name,
            amount: req.body.amount,
            currency: req.body.currency || 'DOP',
            billing_cycle: req.body.billing_cycle,
            next_bill_date: req.body.next_bill_date,
            is_active: req.body.is_active !== undefined ? req.body.is_active : true,
            icon: req.body.icon,
            color: req.body.color,
        };
        const subscription = await subscriptionService.createSubscription(req.user.id, subPayload);
        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        
        // Remove undefined values
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        const updated = await subscriptionService.updateSubscription(id, req.user.id, updates);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        await subscriptionService.deleteSubscription(id, req.user.id);
        res.status(200).json({ message: "Suscripción eliminada correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription
};
