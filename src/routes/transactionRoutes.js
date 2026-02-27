const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

/**
 * @openapi
 * /api/transactions:
 *   post:
 *     summary: Registrar una nueva transacción
 *     description: >
 *       Crea un movimiento (ingreso/gasto) y actualiza el balance de la cuenta.
 *       Nota: Asegúrese de que la columna 'type' exista en su tabla SQL.
 *     tags:
 *       - Transactions
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_id
 *               - category_id
 *               - amount
 *               - type
 *               - currency
 *             properties:
 *               account_id:
 *                 type: string
 *                 format: uuid
 *                 example: "d17e33f8-b9ca-4315-a332-0d7b4780387b"
 *               category_id:
 *                 type: string
 *                 format: uuid
 *                 example: "2c96b2f7-1676-459d-b053-92c2ec40c1df"
 *               amount:
 *                 type: number
 *                 example: 1500.00
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: expense
 *               currency:
 *                 type: string
 *                 default: "DOP"
 *                 example: "DOP"
 *               note:
 *                 type: string
 *                 description: Mapeado internamente como 'note' en la DB
 *                 example: "Compra de supermercado"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-02-22T14:30:00Z"
 *               is_recurring:
 *                 type: boolean
 *                 default: false
 *               receipt_url:
 *                 type: string
 *                 example: "https://cloudinary.com/v123/receipt.jpg"
 *     responses:
 *       201:
 *         description: Transacción creada y balance ajustado.
 *       400:
 *         description: Error de validación o campos faltantes.
 *       500:
 *         description: Error de base de datos (verificar columnas is_pending/description).
 */
router.post('/', transactionController.addTransaction);



/**
 * @openapi
 * /api/transactions:
 *   get:
 *     summary: Obtener historial de transacciones (con filtros)
 *     description: Retorna los movimientos del usuario. Permite filtrar por fechas, tipo y cuenta.
 *     tags:
 *       - Transactions
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin (YYYY-MM-DD)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de transacciones.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: No autorizado.
 */
router.get('/', transactionController.getHistory);


/**
 * @openapi
 * /api/transactions/recent:
 *   get:
 *     summary: Obtener últimas transacciones
 *     description: Retorna las últimas 5 transacciones del usuario.
 *     tags:
 *       - Transactions
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de las últimas transacciones.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: No autorizado.
 */
router.get('/recent', transactionController.getRecent);


/**
 * @openapi
 * /api/transactions/{id}:
 *   delete:
 *     summary: Eliminar y revertir transacción
 *     description: Borra el registro y devuelve el dinero al balance de la cuenta.
 *     tags:
 *       - Transactions
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
 *         description: Transacción eliminada y balance ajustado.
 *       404:
 *         description: No encontrada.
 *       401:
 *         description: No autorizado.
 */
router.delete('/:id', transactionController.removeTransaction);



module.exports = router;