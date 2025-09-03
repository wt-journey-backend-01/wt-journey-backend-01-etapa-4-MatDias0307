const agentsRepository = require("../repositories/agentesRepository");

async function getAllAgents(req, res) {
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
            if (typeof cargo !== 'string') {
                return res.status(400).json({
                    status: 400,
                    message: "Parâmetros inválidos",
                    errors: ["O parâmetro 'cargo' deve ser uma string"]
                });
            }
            
            const normalizedCargo = cargo.toLowerCase();
            if (!['delegado', 'inspetor', 'detetive'].includes(normalizedCargo)) {
                return res.status(400).json({
                    status: 400,
                    message: "Parâmetros inválidos",
                    errors: ["O parâmetro 'cargo' deve ser um dos valores: 'delegado', 'inspetor', 'detetive'"]
                });
            }
        }

        const agents = await agentsRepository.findFiltered({ cargo, sort });

        if (cargo && (!agents || agents.length === 0)) {
            return res.status(404).json({
                status: 404,
                message: "Nenhum agente encontrado para o cargo especificado"
            });
        }

        res.json(agents);
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro interno no servidor",
            error: error.message
        });
    }
}

async function getAgentById(req, res) {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                status: 400,
                message: "ID inválido"
            });
        }

        const agent = await agentsRepository.findById(req.params.id);

        if (agent) {
            res.json(agent);
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

async function createAgent(req, res) {
    try {
        if (req.body.id !== undefined) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors: ["O campo 'id' não pode ser informado na criação"]
            });
        }

        const errors = validateAgentForCreate(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors
            });
        }

        const newAgent = await agentsRepository.create(req.body);

        res.status(201).json({
            status: 201,
            message: "Agente criado com sucesso",
            data: {
                id: newAgent.id,
                nome: newAgent.nome,
                dataDeIncorporacao: newAgent.dataDeIncorporacao,
                cargo: newAgent.cargo
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro interno no servidor",
            error: error.message
        });
    }
}

async function updateAgent(req, res) {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Payload não pode estar vazio",
                errors: ["É necessário enviar os dados para atualização"]
            });
        }

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                status: 400,
                message: "ID inválido"
            });
        }

        const errors = validateAgentForUpdate(req.body, true);
        if (errors.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors
            });
        }

        const existingAgent = await agentsRepository.findById(req.params.id);
        if (!existingAgent) {
            return res.status(404).json({ 
                status: 404,
                message: "Agente não encontrado"
            });
        }

        const updatedAgent = await agentsRepository.update(req.params.id, req.body);
        if (!updatedAgent) {
            return res.status(404).json({ 
                status: 404,
                message: "Agente não encontrado"
            });
        }

        res.json(updatedAgent);
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro interno no servidor",
            error: error.message 
        });
    }
}

async function patchAgent(req, res) {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Payload não pode estar vazio",
                errors: ["É necessário enviar os dados para atualização"]
            });
        }

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                status: 400,
                message: "ID inválido"
            });
        }

        const errors = validateAgentForUpdate(req.body, false);
        if (errors.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors
            });
        }

        const existingAgent = await agentsRepository.findById(req.params.id);
        if (!existingAgent) {
            return res.status(404).json({ 
                status: 404,
                message: "Agente não encontrado"
            });
        }

        const updatedAgent = await agentsRepository.update(req.params.id, req.body);
        if (!updatedAgent) {
            return res.status(404).json({ 
                status: 404,
                message: "Agente não encontrado"
            });
        }

        res.json(updatedAgent);
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro interno no servidor",
            error: error.message 
        });
    }
}

async function deleteAgent(req, res) {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                status: 400,
                message: "ID inválido"
            });
        }

        const existingAgent = await agentsRepository.findById(req.params.id);
        if (!existingAgent) {
            return res.status(404).json({ 
                status: 404,
                message: "Agente não encontrado" 
            });
        }

        await agentsRepository.remove(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro interno no servidor",
            error: error.message 
        });
    }
}

async function getCasesByAgentId(req, res) {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                status: 400,
                message: "ID inválido"
            });
        }
        
        const agent = await agentsRepository.findById(req.params.id);
        if (!agent) {
            return res.status(404).json({
                status: 404,
                message: "Agente não encontrado"
            });
        }

        const cases = await agentsRepository.getCasosByAgenteId(req.params.id);
        res.json(cases);
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro ao buscar casos do agente",
            error: error.message
        });
    }
}

function isValidId(id) {
    const numId = parseInt(id, 10);
    return !isNaN(numId) && numId > 0;
}

function validateAgentForUpdate(agent, isFullUpdate = false) {
    const errors = [];
    
    if (agent.id !== undefined) {
        errors.push("O campo 'id' não pode ser alterado");
    }

    if (isFullUpdate) {
        if (!agent.nome) errors.push("O campo 'nome' é obrigatório");
        if (!agent.dataDeIncorporacao) errors.push("O campo 'dataDeIncorporacao' é obrigatório");
        if (!agent.cargo) errors.push("O campo 'cargo' é obrigatório");
    }

    if (agent.nome !== undefined && typeof agent.nome !== 'string') {
        errors.push("O campo 'nome' deve ser uma string");
    }

    if (agent.dataDeIncorporacao !== undefined) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(agent.dataDeIncorporacao)) {
            errors.push("Formato inválido (use YYYY-MM-DD)");
        } else {
            const [year, month, day] = agent.dataDeIncorporacao.split('-').map(Number);
            const date = new Date(Date.UTC(year, month - 1, day));
            const today = new Date();
            today.setUTCHours(0,0,0,0);
            if (date > today) {
                errors.push("Data não pode ser futura");
            }
        }
    }

    if (agent.cargo !== undefined) {
        if (typeof agent.cargo !== 'string' || !['delegado','inspetor','detetive'].includes(agent.cargo.toLowerCase())) {
            errors.push("Cargo inválido (delegado, inspetor ou detetive)");
        }
    }

    return errors;
}

function validateAgentForCreate(agent) {
    const errors = [];

    if (agent.id !== undefined) {
        errors.push("O campo 'id' não pode ser informado na criação");
    }

    if (!agent.nome) {
        errors.push("O campo 'nome' é obrigatório");
    } else if (typeof agent.nome !== "string") {
        errors.push("O campo 'nome' deve ser uma string");
    }

    if (!agent.dataDeIncorporacao) {
        errors.push("O campo 'dataDeIncorporacao' é obrigatório");
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(agent.dataDeIncorporacao)) {
        errors.push("Formato inválido (use YYYY-MM-DD)" );
    } else {
        const [year, month, day] = agent.dataDeIncorporacao.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        if (date > today) {
            errors.push("Data não pode ser futura");
        }
    }

    if (!agent.cargo) {
        errors.push("O campo 'cargo' é obrigatório" );
    } else if (typeof agent.cargo !== "string" || !['delegado', 'inspetor', 'detetive'].includes(agent.cargo.toLowerCase())) {
        errors.push("Cargo inválido (delegado, inspetor ou detetive)" );
    }

    return errors;
}

module.exports = {
    getAllAgents,
    getAgentById,
    createAgent,
    updateAgent,
    patchAgent,
    deleteAgent,
    getCasesByAgentId
};