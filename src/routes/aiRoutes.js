const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

/**
 * @openapi
 * /api/coach/ask:
 *   post:
 *     summary: Hablar con el Coach IA
 *     tags:
 *       - AI Coach
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Respuesta del Coach generada exitosamente
 */
router.post('/ask', aiController.askCoach);


module.exports = router;