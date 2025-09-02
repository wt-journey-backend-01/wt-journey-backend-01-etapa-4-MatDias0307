const db = require('../db/db');

async function findAll() {
  const agents = await db("agentes");
  return agents.map(mapAgent);
}

async function findById(id) {
  const found = await db("agentes").where({ id: Number(id) }).first();
  return found ? mapAgent(found) : null;
}

async function create(agent) {
  const [created] = await db("agentes").insert(agent).returning("*");
  return mapAgent(created);
}

async function update(updatedData, id) {
  const [updated] = await db("agentes").where({ id: Number(id) }).update(updatedData).returning("*");
  return updated ? mapAgent(updated) : null;
}

async function remove(id) {
  return db("agentes").where({ id: Number(id) }).del();
}

async function findByCargo(cargo) {
  const agents = await db("agentes").where("cargo", "ilike", cargo);
  return agents.map(mapAgent);
}

async function sortByIncorporacao(order = "asc") {
  const agents = await db("agentes").orderBy("dataDeIncorporacao", order === "asc" ? "asc" : "desc");
  return agents.map(mapAgent);
}

async function findFiltered({ cargo, sort } = {}) {
  const qb = db("agentes");

  if (cargo) {
    qb.whereRaw("LOWER(cargo) = ?", [cargo.toLowerCase()]);
  }

  if (sort) {
    qb.orderBy("dataDeIncorporacao", sort.startsWith("-") ? "desc" : "asc");
  }

  const agents = await qb.select("*");
  return agents.map(mapAgent);
}

async function getCasosByAgenteId(agenteId) {
  const casos = await db("casos").where({ agente_id: agenteId });
  return casos.map((caso) =>
    caso.data ? { ...caso, data: formatDate(caso.data) } : caso
  );
}

function formatDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

function mapAgent(agent) {
  return { ...agent, dataDeIncorporacao: formatDate(agent.dataDeIncorporacao) };
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findByCargo,
  sortByIncorporacao,
  findFiltered,
  getCasosByAgenteId,
};
