const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/auth');

/**
 * @openapi
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       properties:
 *         mode:
 *           type: string
 *           example: dark
 *         theme:
 *           type: string
 *           example: Neon
 *         language:
 *           type: string
 *           example: es
 *         currency:
 *           type: string
 *           example: USD
 *
 *     Profile:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: Daviel
 *         lastName:
 *           type: string
 *           example: Sanchez
 *         fullName:
 *           type: string
 *           example: Daviel Sanchez
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: null
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: uuid-v4-format
 *         email:
 *           type: string
 *           format: email
 *           example: alex@financialguard.io
 *         profile:
 *           $ref: '#/components/schemas/Profile'
 *         settings:
 *           $ref: '#/components/schemas/Settings'
 *         lastSignIn:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar usuario con perfil extendido
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login con Cookie y retorno de data extendida
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, retorna perfil y ajustes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario, perfil y ajustes actuales
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos completos de la sesión actual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: No hay sesión o el token es inválido
 */
router.get('/me', authController.getMe);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión (limpia cookies)
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 */
/**
 * @openapi
 * /api/auth/onboarding:
 *   put:
 *     summary: Actualizar estado del onboarding
 *     description: Marca el "Protocolo de Iniciación" como completado (onboarding_completed=true) para el usuario autenticado.
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente.
 *       401:
 *         description: No hay sesión activa o token inválido.
 *       500:
 *         description: Error interno al intentar actualizar perfil en BD.
 */
router.put('/onboarding', authenticate, authController.completeOnboarding);

module.exports = router;