const agentesRepository = require("../repositories/agentesRepository.js");
const positiveIntegerRegex = /^\d+$/;
const dateFormatRegex = /^\d{4}\-(0[1-9]|1[0-2])\-(0[1-9]|[12][0-9]|3[01])$/;

async function listAgents(req, res) {
  try {
    const agents = await agentesRepository.list();
    res.status(200).json(agents);
  } catch (error) {
    console.log("Error in: listAgents\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function findAgent(req, res) {
  try {
    const { id } = req.params;
    
    if (!positiveIntegerRegex.test(id)) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: { id: "O ID deve ter um padrão válido" } 
      });
    }
    
    const agent = await agentesRepository.find(id);
    
    if (!agent) {
      return res.status(404).json({ status: 404, message: "Agente não encontrado" });
    }
    
    res.status(200).json(agent);
  } catch (error) {
    console.log("Error in: findAgent\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

function validateAgentData(data, isPartial = false) {
  const errors = {};
  const allowedFields = ["nome", "dataDeIncorporacao", "cargo"];
  const fields = Object.keys(data);

  const invalidFields = fields.filter(field => !allowedFields.includes(field));
  if (invalidFields.length > 0) {
    errors.general = "O agente deve conter apenas os campos 'nome', 'dataDeIncorporacao' e 'cargo'";
  }

  if (data.id) {
    errors.id = "Não é permitido alterar o ID de um agente.";
  }

  if (!isPartial) {
    if (!data.nome) errors.nome = "O campo 'nome' é obrigatório";
    if (!data.dataDeIncorporacao) errors.dataDeIncorporacao = "O campo 'dataDeIncorporacao' é obrigatório";
    if (!data.cargo) errors.cargo = "O campo 'cargo' é obrigatório";
  }

  if (data.dataDeIncorporacao) {
    if (!data.dataDeIncorporacao.match(dateFormatRegex)) {
      errors.dataDeIncorporacao = "A data de incorporação deve ser uma data válida no formato AAAA-MM-DD";
    } else if (new Date(data.dataDeIncorporacao) > new Date()) {
      errors.dataDeIncorporacao = "A data de incorporação não pode ser uma data futura";
    }
  }

  return errors;
}

async function createAgent(req, res) {
  try {
    const { nome, dataDeIncorporacao, cargo } = req.body;
    
    const errors = validateAgentData(req.body);
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: errors 
      });
    }

    const newAgent = { nome, dataDeIncorporacao, cargo };
    const createdAgent = await agentesRepository.create(newAgent);
    
    res.status(201).json(createdAgent);
  } catch (error) {
    console.log("Error in: createAgent\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function updateAgent(req, res) {
  try {
    const { id } = req.params;
    
    if (!positiveIntegerRegex.test(id)) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: { id: "O ID na URL deve ter um padrão válido" } 
      });
    }

    const errors = validateAgentData(req.body);
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: errors 
      });
    }

    const updatedAgent = await agentesRepository.update(req.body, id);
    
    if (!updatedAgent) {
      return res.status(404).json({ status: 404, message: "Agente não encontrado" });
    }

    res.status(200).json(updatedAgent);
  } catch (error) {
    console.log("Error in: updateAgent\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function partialUpdateAgent(req, res) {
  try {
    const { id } = req.params;
    
    if (!positiveIntegerRegex.test(id)) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: { id: "O ID na URL deve ter um padrão válido" } 
      });
    }

    const existingAgent = await agentesRepository.find(id);
    if (!existingAgent) {
      return res.status(404).json({ status: 404, message: "Agente não encontrado" });
    }

    const errors = validateAgentData(req.body, true);
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: errors 
      });
    }

    const allowedFields = ["nome", "dataDeIncorporacao", "cargo"];
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

    const updatedAgent = await agentesRepository.update(updateData, id);
    res.status(200).json(updatedAgent);
  } catch (error) {
    console.log("Error in: partialUpdateAgent\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function deleteAgent(req, res) {
  try {
    const { id } = req.params;
    
    if (!positiveIntegerRegex.test(id)) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: { id: "O ID deve ter um padrão válido" } 
      });
    }
    
    const success = await agentesRepository.remove(id);
    
    if (success === 0) {
      return res.status(404).json({ status: 404, message: "Agente não encontrado" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.log("Error in: deleteAgent\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

module.exports = {
  listAgents,
  findAgent,
  createAgent,
  updateAgent,
  partialUpdateAgent,
  deleteAgent
};