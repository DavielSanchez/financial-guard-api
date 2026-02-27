const express = require('express');
const router = express.Router();
const envelopeController = require('../controllers/envelopeController');

/**
 * @openapi
 * /api/budget/envelopes:
 *   get:
 *     summary: Obtener todos los sobres de presupuesto
 *     description: Retorna los sobres del usuario con el cálculo del gasto actual ('spent').
 *     tags:
 *       - Budget Envelopes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Mes a consultar (1-12). Por defecto, el mes actual.
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Año a consultar. Por defecto, el año actual.
 *     responses:
 *       200:
 *         description: Lista de sobres de presupuesto.
 *       401:
 *         description: No autorizado.
 */
router.get('/', envelopeController.getEnvelopes);

/**
 * @openapi
 * /api/budget/envelopes:
 *   post:
 *     summary: Crear un nuevo sobre de presupuesto
 *     description: Registra un nuevo sobre para una categoría específica en un periodo determinado.
 *     tags:
 *       - Budget Envelopes
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
 *               budget_amount:
 *                 type: number
 *               period_month:
 *                 type: integer
 *                 description: Opcional, defecto mes actual.
 *               period_year:
 *                 type: integer
 *                 description: Opcional, defecto año actual.
 *     responses:
 *       201:
 *         description: Sobre creado.
 *       409:
 *         description: Ya existe un sobre para esta categoría en este mes/año.
 */
router.post('/', envelopeController.createEnvelope);

/**
 * @openapi
 * /api/budget/envelopes/{id}:
 *   patch:
 *     summary: Actualizar un sobre de presupuesto
 *     description: Modifica el presupuesto asignado a un sobre.
 *     tags:
 *       - Budget Envelopes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               budget_amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Sobre actualizado correctamente.
 */
router.patch('/:id', envelopeController.updateEnvelope);

/**
 * @openapi
 * /api/budget/envelopes/{id}:
 *   delete:
 *     summary: Eliminar un sobre de presupuesto
 *     description: Elimina permanentemente el sobre seleccionado.
 *     tags:
 *       - Budget Envelopes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sobre eliminado.
 */
router.delete('/:id', envelopeController.deleteEnvelope);

module.exports = router;
