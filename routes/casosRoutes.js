const express = require('express');
const router = express.Router();
const casosController = require('../controllers/casosController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Casos
 *   description: Gerenciamento de casos policiais
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /casos:
 *   get:
 *     summary: Lista todos os casos
 *     tags: [Casos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: agente_id
 *         schema:
 *           type: string
 *         description: Filtro por ID do agente responsável
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aberto, solucionado]
 *         description: Filtro por status do caso
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Pesquisa full-text no título e descrição
 *     responses:
 *       200:
 *         description: Lista de casos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Caso'
 *       401:
 *         description: Não autorizado
 */
router.get('/', authMiddleware.authenticateToken, casosController.getAllCasos);

/**
 * @swagger
 * /casos/{id}:
 *   get:
 *     summary: Obtém um caso específico
 *     tags: [Casos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do caso
 *       - in: query
 *         name: includeAgente
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Inclui dados completos do agente responsável
 *     responses:
 *       200:
 *         description: Dados do caso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Caso não encontrado
 */
router.get('/:id', authMiddleware.authenticateToken, casosController.getCasoById);

/**
 * @swagger
 * /casos:
 *   post:
 *     summary: Cria um novo caso
 *     tags: [Casos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Caso'
 *     responses:
 *       201:
 *         description: Caso criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/', authMiddleware.authenticateToken, casosController.createCaso);

/**
 * @swagger
 * /casos/{id}:
 *   put:
 *     summary: Atualiza todos os dados de um caso
 *     tags: [Casos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do caso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Caso'
 *     responses:
 *       200:
 *         description: Caso atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Caso não encontrado
 */
router.put('/:id', authMiddleware.authenticateToken, casosController.updateCaso);

/**
 * @swagger
 * /casos/{id}:
 *   patch:
 *     summary: Atualiza parcialmente os dados de um caso
 *     tags: [Casos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do caso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Caso'
 *     responses:
 *       200:
 *         description: Caso atualizado parcialmente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Caso não encontrado
 */
router.patch('/:id', authMiddleware.authenticateToken, casosController.patchCaso);

/**
 * @swagger
 * /casos/{id}:
 *   delete:
 *     summary: Remove um caso
 *     tags: [Casos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do caso
 *     responses:
 *       204:
 *         description: Caso removido com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Caso não encontrado
 */
router.delete('/:id', authMiddleware.authenticateToken, casosController.deleteCaso);

module.exports = router;