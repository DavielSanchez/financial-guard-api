const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

/**
 * @openapi
 * /api/goals:
 *   get:
 *     summary: Listar todas las metas de ahorro
 *     tags:
 *       - Goals
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de metas obtenida
 *       401:
 *         description: No autorizado
 *
 *   post:
 *     summary: Crear una nueva meta o alcancía
 *     tags:
 *       - Goals
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Reto $1 Diario"
 *               target_amount:
 *                 type: number
 *                 example: 465
 *               is_piggy_bank:
 *                 type: boolean
 *                 example: true
 *               piggy_type:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               start_amount:
 *                 type: number
 *                 example: 1
 *               increment_amount:
 *                 type: number
 *                 example: 1
 *               color:
 *                 type: string
 *                 example: "#FF5733"
 *               icon:
 *                 type: string
 *                 example: "PiggyBank"
 *     responses:
 *       201:
 *         description: Meta creada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', goalController.getAll);

/**
 * @openapi
 * /api/goals:
 *   post:
 *     summary: Crear una nueva meta o alcancía (Piggy Bank)
 *     description: Permite crear metas de ahorro fijas o retos diarios/semanales con incrementos.
 *     tags:
 *       - Goals
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - target_amount
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Reto del Mes: $1 Diario"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               icon:
 *                 type: string
 *                 example: "PiggyBank"
 *               color:
 *                 type: string
 *                 example: "#FF5733"
 *               target_amount:
 *                 type: number
 *                 example: 465.00
 *               saved_already:
 *                 type: number
 *                 default: 0
 *                 example: 0.00
 *               currency:
 *                 type: string
 *                 default: "USD"
 *               is_piggy_bank:
 *                 type: boolean
 *                 example: true
 *               piggy_type:
 *                 type: string
 *                 enum: [daily, weekly, monthly, manual]
 *                 example: "daily"
 *               start_amount:
 *                 type: number
 *                 example: 1.00
 *               increment_amount:
 *                 type: number
 *                 example: 1.00
 *               deadline:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               notify_inactivity_days:
 *                 type: integer
 *                 example: 3
 *               notify_on_risk:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Meta creada exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', goalController.addGoal);

/**
 * @openapi
 * /api/goals/{id}/contribute:
 *   post:
 *     summary: Tachar el día / Aportar a la meta
 *     description: Suma el monto al ahorro actual y actualiza la fecha de racha.
 *     tags:
 *       - Goals
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
 *               amount:
 *                 type: number
 *                 example: 1.00
 *     responses:
 *       200:
 *         description: Aporte registrado y racha actualizada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Meta no encontrada
 */
router.post('/:id/contribute', goalController.contribute);

/**
 * @openapi
 * /api/goals/{id}:
 *   delete:
 *     summary: Eliminar meta
 *     tags:
 *       - Goals
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
 *       204:
 *         description: Meta eliminada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Meta no encontrada
 */
router.delete('/:id', goalController.remove);



module.exports = router;