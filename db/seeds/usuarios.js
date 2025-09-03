const bcrypt = require("bcrypt");

async function seed(knex) {
  await knex("usuarios").del();
  await knex("usuarios").insert([
    { nome: "Matheus", email: "matheus@email.com", senha: await bcrypt.hash("Mudar.1234", 10) },
    { nome: "Lucas", email: "lucas@email.com", senha: await bcrypt.hash("Mudar.321", 10) },
  ]);
}

module.exports = { seed };