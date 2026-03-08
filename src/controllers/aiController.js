const aiService = require('../services/aiService');

const askCoach = async(req, res) => {
    try {
        const { message, history } = req.body;
        const userId = req.user.id;
        if (!message) return res.status(400).json({ error: "El mensaje es obligatorio" });

        const reply = await aiService.getFinancialAdvice(userId, message, history || []);
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { askCoach };