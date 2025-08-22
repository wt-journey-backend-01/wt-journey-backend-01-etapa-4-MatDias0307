const agentesRepository = require("../repositories/agentesRepository");

function validateAgenteForUpdate(agente, isFullUpdate = false) {
    const errors = [];
    
    if (agente.id !== undefined) {
        errors.push({ field: 'id', message: "O campo 'id' não pode ser alterado" });
    }

    if (isFullUpdate) {
        if (!agente.nome) errors.push({ field: 'nome', message: "O campo 'nome' é obrigatório" });
        if (!agente.dataDeIncorporacao) errors.push({ field: 'dataDeIncorporacao', message: "O campo 'dataDeIncorporacao' é obrigatório" });
        if (!agente.cargo) errors.push({ field: 'cargo', message: "O campo 'cargo' é obrigatório" });
    }

    if (agente.nome !== undefined && typeof agente.nome !== 'string') {
        errors.push({ field: 'nome', message: "O campo 'nome' deve ser uma string" });
    }

    if (agente.dataDeIncorporacao !== undefined) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(agente.dataDeIncorporacao)) {
            errors.push({ field: 'dataDeIncorporacao', message: "Formato inválido (use YYYY-MM-DD)" });
        } else {
            const [ano, mes, dia] = agente.dataDeIncorporacao.split('-').map(Number);
            const data = new Date(Date.UTC(ano, mes - 1, dia));
            const hoje = new Date();
            hoje.setUTCHours(0,0,0,0);
            if (data > hoje) {
                errors.push({ field: 'dataDeIncorporacao', message: "Data não pode ser futura" });
            }
        }
    }

    if (agente.cargo !== undefined) {
        if (typeof agente.cargo !== 'string' || !['delegado','inspetor','detetive'].includes(agente.cargo.toLowerCase())) {
            errors.push({ field: 'cargo', message: "Cargo inválido (delegado, inspetor ou detetive)" });
        }
    }

    return errors;
}

function validateAgenteForCreate(agente) {
    const errors = [];

    if (agente.id !== undefined) {
        errors.push({ field: 'id', message: "O campo 'id' não pode ser informado na criação" });
    }

    if (!agente.nome) {
        errors.push({ field: 'nome', message: "O campo 'nome' é obrigatório" });
    } else if (typeof agente.nome !== "string") {
        errors.push({ field: 'nome', message: "O campo 'nome' deve ser uma string" });
    }

    if (!agente.dataDeIncorporacao) {
        errors.push({ field: 'dataDeIncorporacao', message: "O campo 'dataDeIncorporacao' é obrigatório" });
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(agente.dataDeIncorporacao)) {
        errors.push({ field: 'dataDeIncorporacao', message: "Formato inválido (use YYYY-MM-DD)" });
    } else {
        const [ano, mes, dia] = agente.dataDeIncorporacao.split('-').map(Number);
        const data = new Date(Date.UTC(ano, mes - 1, dia));
        const hoje = new Date();
        hoje.setUTCHours(0, 0, 0, 0);
        if (data > hoje) {
            errors.push({ field: 'dataDeIncorporacao', message: "Data não pode ser futura" });
        }
    }

    if (!agente.cargo) {
        errors.push({ field: 'cargo', message: "O campo 'cargo' é obrigatório" });
    } else if (typeof agente.cargo !== "string" || !['delegado', 'inspetor', 'detetive'].includes(agente.cargo.toLowerCase())) {
        errors.push({ field: 'cargo', message: "Cargo inválido (delegado, inspetor ou detetive)" });
    }

    return errors;
}

async function getAllAgentes(req, res) {
    try {
        const { cargo, sort } = req.query;

        if (sort && !['dataDeIncorporacao', '-dataDeIncorporacao'].includes(sort)) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors: ["O parâmetro 'sort' deve ser 'dataDeIncorporacao' ou '-dataDeIncorporacao'"]
            });
        }

        if (cargo !== undefined) {
            if (typeof cargo !== 'string' || !['delegado', 'inspetor', 'detetive'].includes(cargo.toLowerCase())) {
                return res.status(400).json({
                    status: 400,
                    message: "Parâmetros inválidos",
                    errors: ["O parâmetro 'cargo' deve ser um dos valores: 'delegado', 'inspetor', 'detetive'"]
                });
            }
        }

        const agentes = await agentesRepository.findFiltered({ cargo, sort });

        if (cargo && (!agentes || agentes.length === 0)) {
            return res.status(404).json({
                status: 404,
                message: "Nenhum agente encontrado para o cargo especificado"
            });
        }

        res.json(agentes);
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro interno no servidor",
            error: error.message
        });
    }
}

async function getAgenteById(req, res) {
    try {
        const agente = await agentesRepository.findById(req.params.id);
        if (agente) {
            res.json(agente);
        } else {
            res.status(404).json({ 
                status: 404,
                message: "Agente não encontrado" 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro interno no servidor",
            error: error.message 
        });
    }
}

async function createAgente(req, res) {
    try {
        if (req.body.id !== undefined) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors: ["O campo 'id' não pode ser informado na criação"]
            });
        }

        const errors = validateAgenteForCreate(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors
            });
        }

        const novoAgente = await agentesRepository.create(req.body);
        res.status(201).json(novoAgente);
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro interno no servidor",
            error: error.message
        });
    }
}

async function updateAgente(req, res) {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Payload não pode estar vazio",
                errors: ["É necessário enviar os dados para atualização"]
            });
        }

        const errors = validateAgenteForUpdate(req.body, true);
        if (errors.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors
            });
        }

        const agenteExistente = await agentesRepository.findById(req.params.id);
        if (!agenteExistente) {
            return res.status(404).json({ 
                status: 404,
                message: "Agente não encontrado"
            });
        }

        const agenteAtualizado = await agentesRepository.update(req.params.id, req.body);
        res.json(agenteAtualizado);
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro interno no servidor",
            error: error.message 
        });
    }
}

async function patchAgente(req, res) {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Payload não pode estar vazio",
                errors: ["É necessário enviar os dados para atualização"]
            });
        }

        const errors = validateAgenteForUpdate(req.body, false);
        if (errors.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors
            });
        }

        const agenteExistente = await agentesRepository.findById(req.params.id);
        if (!agenteExistente) {
            return res.status(404).json({ 
                status: 404,
                message: "Agente não encontrado"
            });
        }

        const agenteAtualizado = await agentesRepository.update(req.params.id, req.body);
        res.json(agenteAtualizado);
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro interno no servidor",
            error: error.message 
        });
    }
}

async function deleteAgente(req, res) {
    try {
        const agenteExistente = await agentesRepository.findById(req.params.id);
        if (!agenteExistente) {
            return res.status(404).json({ 
                status: 404,
                message: "Agente não encontrado" 
            });
        }

        await agentesRepository.remove(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro interno no servidor",
            error: error.message 
        });
    }
}

async function getCasosByAgenteId(req, res) {
    try {
        const agente = await agentesRepository.findById(req.params.id);
        if (!agente) {
            return res.status(404).json({
                status: 404,
                message: "Agente não encontrado"
            });
        }

        const casos = await agentesRepository.getCasosByAgenteId(req.params.id);
        res.json(casos);
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro ao buscar casos do agente",
            error: error.message
        });
    }
}

module.exports = {
    getAllAgentes,
    getAgenteById,
    createAgente,
    updateAgente,
    patchAgente,
    deleteAgente,
    getCasosByAgenteId
};