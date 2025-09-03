const db = require("../db/db.js");

async function find(email) {
  const user = await db("usuarios")
    .where({ email })
    .first();
  
  return user;
}

async function create(user) {
  const [createdUser] = await db("usuarios")
    .insert(user)
    .returning("*");
  
  return createdUser;
}

async function remove(id) {
  const deleted = await db("usuarios")
    .where({ id: Number(id) })
    .del();
  
  return deleted;
}

module.exports = {
  find,
  create,
  remove
};