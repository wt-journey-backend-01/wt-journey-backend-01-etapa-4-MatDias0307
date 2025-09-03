const casosRepository = require("../repositories/casosRepository.js");
const agentesRepository = require("../repositories/agentesRepository.js");
const positiveIntegerRegex = /^\d+$/;

const allowedStatusValues = ["aberto", "solucionado"];
const allowedFields = ["titulo", "descricao", "status", "agente_id"];

function validateCaseData(data, isPartial = false) {
  const errors = {};
  const fields = Object.keys(data);

  const invalidFields = fields.filter(field => !allowedFields.includes(field));
  if (invalidFields.length > 0) {
    errors.general = "O caso deve conter apenas os campos 'titulo', 'descricao', 'status' e 'agente_id'";
  }

  if (data.id) {
    errors.id = "Não é permitido alterar o ID de um caso.";
  }

  if (!isPartial) {
    if (!data.titulo) errors.titulo = "O campo 'titulo' é obrigatório";
    if (!data.descricao) errors.descricao = "O campo 'descricao' é obrigatório";
    if (!data.status) errors.status = "O campo 'status' é obrigatório";
    if (!data.agente_id) errors.agente_id = "O campo 'agente_id' é obrigatório";
  }

  if (data.status && !allowedStatusValues.includes(data.status)) {
    errors.status = "O Status deve ser 'aberto' ou 'solucionado'";
  }

  if (data.agente_id && !positiveIntegerRegex.test(data.agente_id)) {
    errors.agente_id = "O agente_id deve ter um padrão válido";
  }

  return errors;
}

async function listCases(req, res) {
  try {
    const cases = await casosRepository.list();
    res.status(200).json(cases);
  } catch (error) {
    console.log("Error in: listCases\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function findCase(req, res) {
  try {
    const { id } = req.params;
    
    if (!positiveIntegerRegex.test(id)) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: { id: "O ID deve ter um padrão válido" } 
      });
    }
    
    const caseItem = await casosRepository.find(id);
    
    if (!caseItem) {
      return res.status(404).json({ status: 404, message: "Caso não encontrado" });
    }
    
    res.status(200).json(caseItem);
  } catch (error) {
    console.log("Error in: findCase\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function createCase(req, res) {
  try {
    const { titulo, descricao, status, agente_id } = req.body;
    
    const errors = validateCaseData(req.body);
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: errors 
      });
    }

    const agent = await agentesRepository.find(agente_id);
    if (!agent) {
      return res.status(404).json({ 
        status: 404, 
        message: "O agente com o ID fornecido não foi encontrado" 
      });
    }

    const newCase = { titulo, descricao, status, agente_id };
    const createdCase = await casosRepository.create(newCase);
    
    res.status(201).json(createdCase);
  } catch (error) {
    console.log("Error in: createCase\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function updateCase(req, res) {
  try {
    const { id } = req.params;
    
    if (!positiveIntegerRegex.test(id)) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: { id: "O ID na URL deve ser um padrão válido" } 
      });
    }

    const errors = validateCaseData(req.body);
    
    if (req.body.agente_id) {
      const agent = await agentesRepository.find(req.body.agente_id);
      if (!agent) {
        errors.agente_id = "O agente com o ID fornecido não foi encontrado";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: errors 
      });
    }

    const updatedCase = await casosRepository.update(req.body, id);
    
    if (!updatedCase) {
      return res.status(404).json({ status: 404, message: "Caso não encontrado" });
    }

    res.status(200).json(updatedCase);
  } catch (error) {
    console.log("Error in: updateCase\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function partialUpdateCase(req, res) {
  try {
    const { id } = req.params;
    
    if (!positiveIntegerRegex.test(id)) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: { id: "O ID na URL deve ter um padrão válido" } 
      });
    }

    const errors = validateCaseData(req.body, true);
    
    if (req.body.agente_id) {
      const agent = await agentesRepository.find(req.body.agente_id);
      if (!agent) {
        errors.agente_id = "O agente com o ID fornecido não foi encontrado";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: errors 
      });
    }

    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Nenhum campo válido para atualização foi enviado." 
      });
    }

    const updatedCase = await casosRepository.update(updateData, id);
    
    if (!updatedCase) {
      return res.status(404).json({ status: 404, message: "Caso não encontrado" });
    }

    res.status(200).json(updatedCase);
  } catch (error) {
    console.log("Error in: partialUpdateCase\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function deleteCase(req, res) {
  try {
    const { id } = req.params;
    
    if (!positiveIntegerRegex.test(id)) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: { id: "O ID deve ter um padrão válido" } 
      });
    }
    
    const success = await casosRepository.remove(id);
    
    if (success === 0) {
      return res.status(404).json({ status: 404, message: "Caso não encontrado" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.log("Error in: deleteCase\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

module.exports = {
  listCases,
  findCase,
  createCase,
  updateCase,
  partialUpdateCase,
  deleteCase,
};