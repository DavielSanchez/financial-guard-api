const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

/**
 * @openapi
 * /api/accounts:
 *   get:
 *     summary: Obtiene todas las cuentas del usuario
 *     tags:
 *       - Accounts
 *     responses:
 *       200:
 *         description: Lista de cuentas
 */
router.get('/', accountController.getAccounts);

/**
 * @openapi
 * /api/accounts/total:
 *   get:
 *     summary: Obtiene el balance neto (sin contar cuentas ocultas)
 *     tags:
 *       - Accounts
 *     responses:
 *       200:
 *         description: Balance total
 */
router.get('/total', accountController.getBalance);

/**
 * @openapi
 * /api/accounts/{id}:
 *   patch:
 *     summary: Actualizar parcialmente una cuenta
 *     tags:
 *       - Accounts
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la cuenta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       200:
 *         description: Cuenta actualizada exitosamente
 *       404:
 *         description: Cuenta no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id', accountController.patchAccount);


/**
 * @openapi
 * /api/accounts:
 *   post:
 *     summary: Crear una nueva cuenta financiera
 *     description: Crea una cuenta asociada al usuario autenticado.
 *     tags:
 *       - Accounts
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cuenta Principal
 *               type:
 *                 type: string
 *                 enum: [cash, bank, certificate]
 *                 example: bank
 *               balance:
 *                 type: number
 *                 example: 1500.50
 *               currency:
 *                 type: string
 *                 example: USD
 *               icon:
 *                 type: string
 *                 example: wallet
 *               color:
 *                 type: string
 *                 example: "#4CAF50"
 *               interest_rate:
 *                 type: number
 *                 example: 5
 *               is_hidden:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', accountController.addAccount);

/**
 * @openapi
 * /api/accounts/{id}:
 *   delete:
 *     summary: Eliminar una cuenta financiera
 *     tags:
 *       - Accounts
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la cuenta
 *     responses:
 *       204:
 *         description: Cuenta eliminada correctamente
 *       404:
 *         description: Cuenta no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', accountController.removeAccount);




module.exports = router;