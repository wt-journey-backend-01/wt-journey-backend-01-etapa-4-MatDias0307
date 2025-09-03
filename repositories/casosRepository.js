const db = require("../db/db.js");

async function list() {
  const cases = await db("casos");
  return cases;
}

async function find(id) {
  const caseItem = await db("casos")
    .where({ id: Number(id) })
    .first();
  
  return caseItem;
}

async function create(caseData) {
  const [createdCase] = await db("casos")
    .insert(caseData)
    .returning("*");
  
  return createdCase;
}

async function update(updatedData, id) {
  const [updatedCase] = await db("casos")
    .where({ id: Number(id) })
    .update(updatedData)
    .returning("*");
  
  return updatedCase;
}

async function remove(id) {
  const deleted = await db("casos")
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