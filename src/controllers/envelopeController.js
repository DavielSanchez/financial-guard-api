const envelopeService = require('../services/envelopeService');

const getEnvelopes = async (req, res) => {
    try {
        const { month, year } = req.query;
        const envelopes = await envelopeService.getEnvelopes(req.user.id, month, year);
        res.json(envelopes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createEnvelope = async (req, res) => {
    try {
        const envelopePayload = {
            category_id: req.body.category_id,
            budget_amount: req.body.budget_amount,
            period_month: req.body.period_month || new Date().getMonth() + 1,
            period_year: req.body.period_year || new Date().getFullYear(),
        };
        const envelope = await envelopeService.createEnvelope(req.user.id, envelopePayload);
        res.status(201).json(envelope);
    } catch (error) {
        if (error.message.includes('Ya existe')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

const updateEnvelope = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {
            budget_amount: req.body.budget_amount,
        };
        
        // Remove undefined keys to prevent erasing existing values implicitly
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        const updated = await envelopeService.updateEnvelope(id, req.user.id, updates);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteEnvelope = async (req, res) => {
    try {
        const { id } = req.params;
        await envelopeService.deleteEnvelope(id, req.user.id);
        res.status(200).json({ message: "Sobre eliminado correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getEnvelopes,
    createEnvelope,
    updateEnvelope,
    deleteEnvelope
};
