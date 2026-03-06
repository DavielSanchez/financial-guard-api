const budgetTemplateService = require('../services/budgetTemplateService');

const upsertTemplate = async (req, res) => {
    try {
        const { category_id, budget_amount } = req.body;

        if (!category_id || budget_amount === undefined) {
             return res.status(400).json({ error: "category_id and budget_amount are required." });
        }

        const template = await budgetTemplateService.upsertTemplate(req.user.id, category_id, budget_amount);
        res.status(200).json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    upsertTemplate
};
