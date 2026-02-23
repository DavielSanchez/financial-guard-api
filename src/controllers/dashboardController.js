const dashboardService = require('../services/dashboardService');

const getSummary = async(req, res) => {
    try {
        const { period = 'Day' } = req.query;
        const data = await dashboardService.getStats(req.user.id, period);
        res.status(200).json(data);
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ error: "Error al obtener el resumen del dashboard" });
    }
};

module.exports = { getSummary };