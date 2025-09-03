const db = require("../db/db.js");

function formatAgentData(agent) {
  return {
    ...agent,
    dataDeIncorporacao: new Date(agent.dataDeIncorporacao).toISOString().split("T")[0]
  };
}

async function list() {
  const agents = await db("agentes");
  return agents.map(formatAgentData);
}

async function find(id) {
  const agent = await db("agentes")
    .where({ id: Number(id) })
    .first();

  if (!agent) return null;
  return formatAgentData(agent);
}

async function create(agent) {
  const [createdAgent] = await db("agentes")
    .insert(agent)
    .returning("*");
  
  return formatAgentData(createdAgent);
}

async function update(updatedData, id) {
  const [updatedAgent] = await db("agentes")
    .where({ id: Number(id) })
    .update(updatedData)
    .returning("*");

  if (!updatedAgent) return null;
  return formatAgentData(updatedAgent);
}

async function remove(id) {
  const deleted = await db("agentes")
    .where({ id: Number(id) })
    .del();
  
  return deleted;
}

module.exports = {
  list,
  find,
  create,
  update,
  remove
};