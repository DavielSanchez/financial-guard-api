const dashboardService = require('../services/dashboardService');

const getSummary = async(req, res) => {
    try {
        const { period = 'Day', global } = req.query;
        const isGlobal = global === 'true';
        const data = await dashboardService.getStats(req.user.id, period, isGlobal);
        res.status(200).json(data);
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ error: "Error al obtener el resumen del dashboard" });
    }
};

module.exports = { getSummary };