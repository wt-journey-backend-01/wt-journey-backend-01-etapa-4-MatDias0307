const express = require('express');
const router = express.Router();
const agentesController = require('../controllers/agentesController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Agentes
 *   description: Gerenciamento de agentes policiais
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
 * /agentes:
 *   get:
 *     summary: Lista todos os agentes
 *     tags: [Agentes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cargo
 *         schema:
 *           type: string
 *         description: Filtro por cargo (inspetor, delegado, etc.)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Ordenação por data de incorporação (dataDeIncorporacao ou -dataDeIncorporacao)
 *     responses:
 *       200:
 *         description: Lista de agentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agente'
 *       401:
 *         description: Não autorizado
 */
router.get('/', authMiddleware.authenticateToken, agentesController.getAllAgentes);

/**
 * @swagger
 * /agentes/{id}:
 *   get:
 *     summary: Obtém um agente específico
 *     tags: [Agentes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agente
 *     responses:
 *       200:
 *         description: Dados do agente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Agente não encontrado
 */
router.get('/:id', authMiddleware.authenticateToken, agentesController.getAgenteById);

/**
 * @swagger
 * /agentes:
 *   post:
 *     summary: Cria um novo agente
 *     tags: [Agentes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agente'
 *     responses:
 *       201:
 *         description: Agente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/', authMiddleware.authenticateToken, agentesController.createAgente);

/**
 * @swagger
 * /agentes/{id}:
 *   put:
 *     summary: Atualiza todos os dados de um agente
 *     tags: [Agentes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agente'
 *     responses:
 *       200:
 *         description: Agente atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Agente não encontrado
 */
router.put('/:id', authMiddleware.authenticateToken, agentesController.updateAgente);

/**
 * @swagger
 * /agentes/{id}:
 *   patch:
 *     summary: Atualiza parcialmente os dados de um agente
 *     tags: [Agentes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agente'
 *     responses:
 *       200:
 *         description: Agente atualizado parcialmente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Agente não encontrado
 */
router.patch('/:id', authMiddleware.authenticateToken, agentesController.patchAgente);

/**
 * @swagger
 * /agentes/{id}:
 *   delete:
 *     summary: Remove um agente
 *     tags: [Agentes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agente
 *     responses:
 *       204:
 *         description: Agente removido com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Agente não encontrado
 */
router.delete('/:id', authMiddleware.authenticateToken, agentesController.deleteAgente);

/**
 * @swagger
 * /agentes/{id}/casos:
 *   get:
 *     summary: Lista todos os casos de um agente
 *     tags: [Agentes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agente
 *     responses:
 *       200:
 *         description: Lista de casos do agente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Caso'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Agente não encontrado
 */
router.get('/:id/casos', authMiddleware.authenticateToken, agentesController.getCasosByAgenteId);

module.exports = router;