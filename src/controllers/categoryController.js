const categoryService = require('../services/categoryService');

const getCategories = async(req, res) => {
    try {
        const categories = await categoryService.getAll(req.user.id);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addCategory = async(req, res) => {
    try {
        const category = await categoryService.create(req.user.id, req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeCategory = async(req, res) => {
    try {
        await categoryService.delete(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getCategories, addCategory, removeCategory };