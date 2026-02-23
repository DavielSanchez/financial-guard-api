const goalService = require('../services/goalService');

const addGoal = async(req, res) => {
    try {
        const goal = await goalService.createGoal(req.user.id, req.body);
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAll = async(req, res) => {
    try {
        const goals = await goalService.getGoals(req.user.id);
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const contribute = async(req, res) => {
    try {
        const { amount } = req.body;
        const updated = await goalService.contributeToGoal(req.params.id, req.user.id, amount);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const remove = async(req, res) => {
    try {
        await goalService.deleteGoal(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addGoal, getAll, contribute, remove };