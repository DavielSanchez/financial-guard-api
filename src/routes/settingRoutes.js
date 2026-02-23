const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

/**
 * @openapi
 * /api/settings/update-setting:
 *   patch:
 *     summary: Actualiza los ajustes del usuario y/o nombre de perfil
 *     tags: 
 *       - Settings
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               mode:
 *                 type: string
 *                 enum: [dark, light, system]
 *               theme:
 *                 type: string
 *                 example: "Neon"
 *               language:
 *                 type: string
 *                 example: "es"
 *               currency:
 *                 type: string
 *                 example: "DOP"
 *     responses:
 *       200:
 *         description: Ajustes actualizados con éxito
 *       401:
 *         description: No autorizado
 */
router.patch('/update-setting', settingController.updatUserSettings);

module.exports = router;