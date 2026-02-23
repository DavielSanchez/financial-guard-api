const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');


/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Obtener catálogo de categorías
 *     description: Retorna las categorías globales (sistema) y las personalizadas del usuario logueado.
 *     tags:
 *       - Categorias
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         description: No autorizado.
 *
 *   post:
 *     summary: Crear categoría personalizada
 *     description: Registra una nueva categoría que solo será visible para el usuario creador.
 *     tags:
 *       - Categorias
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
 *               - type
 *               - icon
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Suscripciones"
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: "expense"
 *               icon:
 *                 type: string
 *                 example: "Youtube"
 *               color:
 *                 type: string
 *                 example: "#FF0000"
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error del servidor.
 */
router.get('/', categoryController.getCategories);
router.post('/', categoryController.addCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Eliminar categoría personalizada
 *     description: Elimina una categoría específica siempre que pertenezca al usuario. Las globales no se pueden borrar.
 *     tags:
 *       - Categorias
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la categoría a eliminar.
 *     responses:
 *       204:
 *         description: Categoría eliminada.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: La categoría no pertenece al usuario.
 *       404:
 *         description: Categoría no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:id', categoryController.removeCategory);



module.exports = router;