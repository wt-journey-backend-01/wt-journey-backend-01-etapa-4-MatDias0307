const express = require("express");
const router = express.Router();
const agentesController = require("../controllers/agentesController.js");

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
 *   schemas:
 *     Agente:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do agente
 *         nome:
 *           type: string
 *           description: Nome do agente
 *         dataDeIncorporacao:
 *           type: string
 *           format: date
 *           description: Data de incorporação (YYYY-MM-DD)
 *         cargo:
 *           type: string
 *           enum: [delegado, inspetor, detetive]
 *           description: Cargo do agente
 *       required:
 *         - nome
 *         - dataDeIncorporacao
 *         - cargo
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
 *           enum: [delegado, inspetor, detetive]
 *         description: Filtro por cargo
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [dataDeIncorporacao, -dataDeIncorporacao]
 *         description: Ordenação por data de incorporação
 *     responses:
 *       200:
 *         description: Lista de agentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agente'
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autorizado
 */
router.get("/", agentesController.listAgents);

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
 *           type: integer
 *         required: true
 *         description: ID do agente
 *     responses:
 *       200:
 *         description: Dados do agente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Agente não encontrado
 */
router.get("/:id", agentesController.findAgent);

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
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Agente'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post("/", agentesController.createAgent);

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
 *           type: integer
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
router.put("/:id", agentesController.updateAgent);

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
 *           type: integer
 *         required: true
 *         description: ID do agente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               dataDeIncorporacao:
 *                 type: string
 *                 format: date
 *               cargo:
 *                 type: string
 *                 enum: [delegado, inspetor, detetive]
 *     responses:
 *       200:
 *         description: Agente atualizado parcialmente
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
router.patch("/:id", agentesController.partialUpdateAgent);

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
 *           type: integer
 *         required: true
 *         description: ID do agente
 *     responses:
 *       204:
 *         description: Agente removido com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Agente não encontrado
 */
router.delete("/:id", agentesController.deleteAgent);

module.exports = router;