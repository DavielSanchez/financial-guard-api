const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

/**
 * @openapi
 * /api/budget/subscriptions:
 *   get:
 *     summary: Obtener todas las suscripciones (Drainers)
 *     description: Retorna las suscripciones del usuario y el cálculo del gasto mensual total (total_monthly_drain).
 *     tags:
 *       - Subscriptions
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Resumen de suscripciones.
 *       401:
 *         description: No autorizado.
 */
router.get('/', subscriptionController.getSubscriptions);

/**
 * @openapi
 * /api/budget/subscriptions:
 *   post:
 *     summary: Crear una suscripción
 *     description: Registra una nueva suscripción periódica.
 *     tags:
 *       - Subscriptions
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
 *               - amount
 *               - billing_cycle
 *               - next_bill_date
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               billing_cycle:
 *                 type: string
 *                 enum: [monthly, yearly, weekly, daily]
 *               next_bill_date:
 *                 type: string
 *                 format: date-time
 *               is_active:
 *                 type: boolean
 *                 default: true
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Suscripción creada.
 */
router.post('/', subscriptionController.createSubscription);

/**
 * @openapi
 * /api/budget/subscriptions/{id}:
 *   patch:
 *     summary: Actualizar una suscripción
 *     description: Modifica los detalles de una suscripción. Usado frecuentemente para alternar 'is_active'.
 *     tags:
 *       - Subscriptions
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
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               billing_cycle:
 *                 type: string
 *                 enum: [monthly, yearly, weekly, daily]
 *               next_bill_date:
 *                 type: string
 *                 format: date-time
 *               is_active:
 *                 type: boolean
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Suscripción actualizada correctamente.
 */
router.patch('/:id', subscriptionController.updateSubscription);

/**
 * @openapi
 * /api/budget/subscriptions/{id}:
 *   delete:
 *     summary: Eliminar permanentemente una suscripción
 *     description: Borra el registro de la suscripción.
 *     tags:
 *       - Subscriptions
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
 *         description: Suscripción eliminada.
 */
router.delete('/:id', subscriptionController.deleteSubscription);

module.exports = router;
