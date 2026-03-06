const express = require('express');
const router = express.Router();
const budgetTemplateController = require('../controllers/budgetTemplateController');

/**
 * @openapi
 * /api/budget/templates:
 *   post:
 *     summary: Crear o actualizar un template de presupuesto fijo.
 *     description: Actualiza el presupuesto base (fijo) de una categoría para usarlo en la generación de sobres mensuales.
 *     tags:
 *       - Budget Templates
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - budget_amount
 *             properties:
 *               category_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la categoría
 *               budget_amount:
 *                 type: number
 *                 description: Monto fijo deseado para la categoría
 *     responses:
 *       200:
 *         description: Template actualizado o creado exitosamente.
 *       400:
 *         description: Datos requeridos faltantes.
 *       401:
 *         description: No autorizado.
 */
router.post('/', budgetTemplateController.upsertTemplate);

module.exports = router;
