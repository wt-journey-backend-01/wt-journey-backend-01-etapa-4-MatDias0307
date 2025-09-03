const casosRepository = require("../repositories/casosRepository.js");
const agentesRepository = require("../repositories/agentesRepository.js");
const intPos = /^\d+$/; // Regex para aceitar número inteiro positivos

// Mostrar Todos os Casos
async function listarCasos(req, res) {
  try {
    const casos = await casosRepository.listar();
    res.status(200).json(casos);
  } catch (error) {
    console.log("Erro referente a: listarCasos\n");
    console.log(error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

// ----- Mostrar Caso Referente ao ID -----
async function encontrarCaso(req, res) {
  try {
    const { id } = req.params;
    if (!intPos.test(id)) {
      return res.status(404).json({ status: 404, message: "Parâmetros inválidos", error: { id: "O ID deve ter um padrão válido" } });
    }
    const caso = await casosRepository.encontrar(id);
    if (!caso) {
      return res.status(404).json({ status: 404, message: "Caso não encontrado" });
    }
    res.status(200).json(caso);
  } catch (error) {
    console.log("Erro referente a: encontrarCaso\n");
    console.log(error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

// ----- Adicionar Novo Caso -----
async function adicionarCaso(req, res) {
  try {
    const { titulo, descricao, status, agente_id } = req.body;

    const erros = {};
    const camposPermitidos = ["titulo", "descricao", "status", "agente_id"];
    const campos = Object.keys(req.body);

    if (campos.some((campo) => !camposPermitidos.includes(campo))) {
      erros.geral = "O caso deve conter apenas os campos 'titulo', 'descricao', 'status' e 'agente_id'";
    }
    if (!titulo) erros.titulo = "O campo 'titulo' é obrigatório";
    if (!descricao) erros.descricao = "O campo 'descricao' é obrigatório";
    if (!status) erros.status = "O campo 'status' é obrigatório";
    if (!agente_id) erros.agente_id = "O campo 'agente_id' é obrigatório";

    if (status && status !== "aberto" && status !== "solucionado") {
      erros.status = "O Status deve ser 'aberto' ou 'solucionado'";
    }
    if (agente_id && !intPos.test(agente_id)) {
      return res.status(404).json({ status: 404, message: "O agente_id deve ter um padrão válido" });
    }
    if (Object.keys(erros).length > 0) {
      return res.status(400).json({ status: 400, message: "Parâmetros inválidos", error: erros });
    }

    const agenteDoCaso = await agentesRepository.encontrar(agente_id);
    if (!agenteDoCaso || Object.keys(agenteDoCaso).length === 0) {
      return res.status(404).json({ status: 404, message: "O agente com o ID fornecido não foi encontrado" });
    }

    const novoCaso = { titulo, descricao, status, agente_id };
    const [casoCriado] = await casosRepository.adicionar(novoCaso);
    res.status(201).json(casoCriado);
  } catch (error) {
    console.log("Erro referente a: adicionarCaso\n");
    console.log(error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

// ----- Atualizar Informações do Caso -----
async function atualizarCaso(req, res) {
  try {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id, id: bodyId } = req.body;
    if (!intPos.test(id)) {
      return res.status(404).json({ status: 404, message: "Parâmetros inválidos", error: { id: "O ID na URL deve ser um padrão válido" } });
    }

    const erros = {};
    const camposPermitidos = ["titulo", "descricao", "status", "agente_id"];
    const campos = Object.keys(req.body);

    if (bodyId) {
      erros.id = "Não é permitido alterar o ID de um caso.";
    }

    if (campos.some((campo) => !camposPermitidos.includes(campo))) {
      erros.geral = "O caso deve conter apenas os campos 'titulo', 'descricao', 'status' e 'agente_id'";
    }
    if (!titulo) erros.titulo = "O campo 'titulo' é obrigatório";
    if (!descricao) erros.descricao = "O campo 'descricao' é obrigatório";
    if (!status) erros.status = "O campo 'status' é obrigatório";
    if (!agente_id) erros.agente_id = "O campo 'agente_id' é obrigatório";

    if (status && status !== "aberto" && status !== "solucionado") {
      erros.status = "O Status deve ser 'aberto' ou 'solucionado'";
    }
    if (agente_id && !intPos.test(agente_id)) {
      erros.agente_id = "O agente_id deve ter um padrão válido";
    } else if (agente_id && !(await agentesRepository.encontrar(agente_id))) {
      erros.agente_id = "O agente com o ID fornecido não foi encontrado";
    }
    if (Object.keys(erros).length > 0) {
      return res.status(400).json({ status: 400, message: "Parâmetros inválidos", error: erros });
    }

    const [casoAtualizado] = await casosRepository.atualizar({ titulo, descricao, status, agente_id }, id);
    if (!casoAtualizado) {
      return res.status(404).json({ status: 404, message: "Caso não encontrado" });
    }

    res.status(200).json(casoAtualizado);
  } catch (error) {
    console.log("Erro referente a: atualizarCaso\n");
    console.log(error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

// ----- Atualizar Informações Parciais Caso -----
async function atualizarCasoParcial(req, res) {
  try {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id, id: bodyId } = req.body;
    if (!intPos.test(id)) {
      return res.status(404).json({ status: 404, message: "Parâmetros inválidos", error: { id: "O ID na URL deve ter um padrão válido" } });
    }

    const erros = {};
    const camposPermitidos = ["titulo", "descricao", "status", "agente_id"];
    const campos = Object.keys(req.body);

    if (campos.some((campo) => !camposPermitidos.includes(campo))) {
      erros.geral = "Campos inválidos enviados. Permitidos: 'titulo', 'descricao', 'status', 'agente_id'";
    }
    if (bodyId) {
      erros.id = "Não é permitido alterar o ID de um caso.";
    }
    if (status && status !== "aberto" && status !== "solucionado") {
      erros.status = "O Status deve ser 'aberto' ou 'solucionado'";
    }

    if (agente_id) {
      if (!intPos.test(agente_id)) {
        erros.agente_id = "O agente_id deve ter um padrão válido";
      } else if (!(await agentesRepository.encontrar(agente_id))) {
        erros.agente_id = "O agente com o ID fornecido não foi encontrado";
      }
    }

    if (Object.keys(erros).length > 0) {
      return res.status(400).json({ status: 400, message: "Parâmetros inválidos", error: erros });
    }

    const dadosAtualizados = {};
    if (titulo !== undefined) dadosAtualizados.titulo = titulo;
    if (descricao !== undefined) dadosAtualizados.descricao = descricao;
    if (status !== undefined) dadosAtualizados.status = status;
    if (agente_id !== undefined) dadosAtualizados.agente_id = agente_id;

    if (Object.keys(dadosAtualizados).length === 0) {
      return res.status(400).json({ status: 400, message: "Nenhum campo válido para atualização foi enviado." });
    }

    const [casoAtualizado] = await casosRepository.atualizar(dadosAtualizados, id);
    if (!casoAtualizado) {
      return res.status(404).json({ status: 404, message: "Caso não encontrado" });
    }

    res.status(200).json(casoAtualizado);
  } catch (error) {
    console.log("Erro referente a: atualizarCaso\n");
    console.log(error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

// ----- Deletar Caso -----
async function deletarCaso(req, res) {
  try {
    const { id } = req.params;
    if (!intPos.test(id)) {
      return res.status(400).json({ status: 400, message: "Parâmetros inválidos", error: { id: "O ID deve ter um padrão válido" } });
    }
    const sucesso = await casosRepository.deletar(id);
    if (sucesso === 0) {
      return res.status(404).json({ status: 404, message: "Caso não encontrado" });
    }
    res.status(204).end();
  } catch (error) {
    console.log("Erro referente a: deletarCaso\n");
    console.log(error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

// ----- Exports -----
module.exports = {
  listarCasos,
  encontrarCaso,
  adicionarCaso,
  atualizarCaso,
  atualizarCasoParcial,
  deletarCaso,
};
