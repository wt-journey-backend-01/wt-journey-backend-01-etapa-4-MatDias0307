const db = require("../db/db.js");

// ----- Mostrar Todos os Agentes -----
async function listar() {
  const listado = await db("agentes");
  return listado.map((agente) => ({ ...agente, dataDeIncorporacao: new Date(agente.dataDeIncorporacao).toISOString().split("T")[0] }));
}

// ----- Mostrar Agente Referente ao ID -----
async function encontrar(id) {
  const encontrado = await db("agentes")
    .where({ id: Number(id) })
    .first();

  if (!encontrado) return null;

  return { ...encontrado, dataDeIncorporacao: new Date(encontrado.dataDeIncorporacao).toISOString().split("T")[0] };
}

// ----- Adicionar Novo Agente -----
async function adicionar(agente) {
  const [adicionado] = await db("agentes").insert(agente).returning("*");
  return { ...adicionado, dataDeIncorporacao: new Date(adicionado.dataDeIncorporacao).toISOString().split("T")[0] };
}

// ----- Atualizar Informações do Agente -----
async function atualizar(dadosAtualizados, id) {
  const [atualizado] = await db("agentes")
    .where({ id: Number(id) })
    .update(dadosAtualizados)
    .returning("*");

  if (!atualizado) return null;
  return { ...atualizado, dataDeIncorporacao: new Date(atualizado.dataDeIncorporacao).toISOString().split("T")[0] };
}

// ----- Deletar Agente -----
async function deletar(id) {
  const deletado = await db("agentes")
    .where({ id: Number(id) })
    .del();
  return deletado;
}

// ----- Exports -----
module.exports = {
  listar,
  encontrar,
  adicionar,
  atualizar,
  deletar,
};
