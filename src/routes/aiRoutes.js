const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

/**
 * @openapi
 * /api/coach/ask:
 *   post:
 *     summary: Hablar con el Coach IA con contexto
 *     tags:
 *       - AI Coach
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, model]
 *                     parts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *     responses:
 *       200:
 *         description: Respuesta del Coach generada exitosamente
 */
router.post('/ask', aiController.askCoach);


module.exports = router;