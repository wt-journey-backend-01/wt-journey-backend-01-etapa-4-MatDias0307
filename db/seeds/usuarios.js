const bcrypt = require("bcrypt");
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

async function seed(knex) {
  // deleta:
  await knex("usuarios").del();
  // popula:
  await knex("usuarios").insert([
    { nome: "Matheus", email: "matheus@email.com", senha: await bcrypt.hash("Mudar.1234", 10) },
    { nome: "Lucas", email: "lucas@email.com", senha: await bcrypt.hash("Mudar.321", 10) },
  ]);
}

module.exports = { seed };
