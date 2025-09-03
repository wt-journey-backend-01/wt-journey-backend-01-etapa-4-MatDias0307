const casesRepository = require("../repositories/casosRepository");
const agentsRepository = require("../repositories/agentesRepository");

async function getAllCases(req, res) {
    try {
        const { agente_id, status, q } = req.query;

        if (status && typeof status === 'string' && !['aberto', 'solucionado'].includes(status.toLowerCase())) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors: ["O parâmetro 'status' deve ser 'aberto' ou 'solucionado'"]
            });
        }

        const cases = await casesRepository.searchWithFilters({ agente_id, status, q });

        if (cases.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Nenhum caso encontrado para os filtros especificados"
            });
        }

        res.json(cases);
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro interno no servidor",
            error: error.message
        });
    }
}

async function getCaseById(req, res) {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                status: 400,
                message: "ID inválido"
            });
        }

        const caseData = await casesRepository.findById(req.params.id);
        if (!caseData) {
            return res.status(404).json({ 
                status: 404,
                message: "Caso não encontrado" 
            });
        }

        if (req.query.includeAgente === 'true') {
            const agent = await agentsRepository.findById(caseData.agente_id);
            return res.json({ ...caseData, agente: agent });
        }

        res.json(caseData);
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro interno no servidor",
            error: error.message 
        });
    }
}

async function createCase(req, res) {
    try {
        const errors = validateCase(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ 
                status: 400,
                message: "Parâmetros inválidos",
                errors
            });
        }

        const agentExists = await agentsRepository.findById(req.body.agente_id);
        if (!agentExists) {
            return res.status(404).json({
                status: 404,
                message: "Recurso não encontrado",
                errors: ["O agente_id fornecido não existe"]
            });
        }

        const newCase = await casesRepository.create(req.body);

        res.status(201).json({
            status: 201,
            message: "Caso criado com sucesso",
            data: {
                id: newCase.id,
                titulo: newCase.titulo,
                descricao: newCase.descricao,
                status: newCase.status,
                agente_id: newCase.agente_id
            }
        });
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro ao criar caso",
            error: error.message 
        });
    }
}

async function updateCase(req, res) {
    try {
        if (req.body.id !== undefined) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors: ["O campo 'id' não pode ser alterado"]
            });
        }

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                status: 400,
                message: "ID inválido"
            });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Payload não pode estar vazio"
            });
        }

        const errors = validateCase(req.body, false);
        if (errors.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors
            });
        }

        if (req.body.agente_id) {
            const agentExists = await agentsRepository.findById(req.body.agente_id);
            if (!agentExists) {
                return res.status(404).json({
                    status: 404,
                    message: "Agente não encontrado"
                });
            }
        }

        const updatedCase = await casesRepository.update(req.params.id, req.body);
        if (!updatedCase) {
            return res.status(404).json({ 
                status: 404,
                message: "Caso não encontrado"
            });
        }

        res.json(updatedCase);
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro interno no servidor",
            error: error.message 
        });
    }
}

async function patchCase(req, res) {
    try {
        if (req.body.id !== undefined) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors: ["O campo 'id' não pode ser alterado"]
            });
        }

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                status: 400,
                message: "ID inválido"
            });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Payload não pode estar vazio",
                errors: ["É necessário enviar os dados para atualização"]
            });
        }

        const existingCase = await casesRepository.findById(req.params.id);
        if (!existingCase) {
            return res.status(404).json({ 
                status: 404,
                message: "Recurso não encontrado",
                errors: ["Caso não encontrado para o ID especificado"]
            });
        }

        if (req.body.agente_id) {
            const agentExists = await agentsRepository.findById(req.body.agente_id);
            if (!agentExists) {
                return res.status(404).json({
                    status: 404,
                    message: "Recurso não encontrado",
                    errors: ["O agente_id fornecido não existe"]
                });
            }
        }

        const errors = validateCasePartial(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Parâmetros inválidos",
                errors
            });
        }

        const updatedCase = await casesRepository.update(req.params.id, req.body);
        if (!updatedCase) {
            return res.status(404).json({ 
                status: 404,
                message: "Caso não encontrado"
            });
        }

        res.json(updatedCase);
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro interno no servidor",
            error: error.message 
        });
    }
}

async function deleteCase(req, res) {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                status: 400,
                message: "ID inválido"
            });
        }
        
        const existingCase = await casesRepository.findById(req.params.id);
        if (!existingCase) {
            return res.status(404).json({ 
                status: 404,
                message: "Caso não encontrado" 
            });
        }

        await casesRepository.remove(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ 
            status: 500,
            message: "Erro interno no servidor",
            error: error.message 
        });
    }
}

function isValidId(id) {
    const numId = parseInt(id, 10);
    return !isNaN(numId) && numId > 0;
}

function validateCase(caseData, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
        if (!caseData.titulo) errors.push("O campo 'titulo' é obrigatório");
        if (!caseData.descricao) errors.push("O campo 'descricao' é obrigatório");
        if (!caseData.status) errors.push("O campo 'status' é obrigatório");
        if (!caseData.agente_id) errors.push("O campo 'agente_id' é obrigatório");
    }

    if (caseData.status && !['aberto', 'solucionado'].includes(caseData.status)) {
        errors.push("O campo 'status' pode ser somente 'aberto' ou 'solucionado'");
    }

    if (caseData.titulo && typeof caseData.titulo !== "string") {
        errors.push("O campo 'titulo' deve ser uma string");
    }
    if (caseData.descricao && typeof caseData.descricao !== "string") {
        errors.push("O campo 'descricao' deve ser uma string");
    }

    return errors;
}

function validateCasePartial(caseData) {
    const errors = [];

    if (Object.keys(caseData).length === 0) {
        errors.push("Payload não pode estar vazio");
        return errors;
    }

    if (caseData.status && !['aberto', 'solucionado'].includes(caseData.status)) {
        errors.push("O campo 'status' pode ser somente 'aberto' ou 'solucionado'");
    }

    if (caseData.titulo && typeof caseData.titulo !== "string") {
        errors.push("O campo 'titulo' deve ser uma string");
    }

    if (caseData.descricao && typeof caseData.descricao !== "string") {
        errors.push("O campo 'descricao' deve ser uma string");
    }

    return errors;
}

module.exports = {
    getAllCases,
    getCaseById,
    createCase,
    updateCase,
    patchCase,
    deleteCase
};