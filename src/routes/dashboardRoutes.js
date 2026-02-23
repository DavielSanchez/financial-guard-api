const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');


/**
 * @openapi
 * /api/dashboard/summary:
 *   get:
 *     summary: Obtener resumen general del dashboard
 *     description: Retorna balance neto, ingresos/gastos del mes y estado de las metas en riesgo.
 *     tags:
 *       - Dashboard
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos del dashboard obtenidos con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 net_worth:
 *                   type: number
 *                   example: 25400.50
 *                 monthly_cashflow:
 *                   type: object
 *                   properties:
 *                     income:
 *                       type: number
 *                       example: 5000
 *                     expense:
 *                       type: number
 *                       example: 3200
 *                 goals_overview:
 *                   type: object
 *                   properties:
 *                     total_active:
 *                       type: integer
 *                       example: 3
 *                     at_risk:
 *                       type: integer
 *                       example: 1
 *                     risk_list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/summary', dashboardController.getSummary);

/**
 * @openapi
 * /api/dashboard/categories:
 *   get:
 *     summary: Gastos por categoría del mes
 *     description: Retorna el análisis de gastos segmentado por categorías para gráficos (pie chart).
 *     tags:
 *       - Dashboard
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Análisis de gastos segmentado por categorías.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category_id:
 *                     type: string
 *                     format: uuid
 *                   category_name:
 *                     type: string
 *                   total_amount:
 *                     type: number
 *       401:
 *         description: No autorizado.
 */
router.get('/categories', (req, res) => res.json({ message: "Próximamente: Agrupación por categorías" }));

module.exports = router;