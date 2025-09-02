const bcrypt = require("bcrypt");

async function seed(knex) {
  await knex("usuarios").del();

  const senhaAdmin = await bcrypt.hash('Admin123!', 12);
  const senhaDelegado = await bcrypt.hash('Delegado123!', 12);
  const senhaInspetor = await bcrypt.hash('Inspetor123!', 12);

  await knex("usuarios").insert([
    {
      nome: 'Administrador do Sistema',
      email: 'admin@policia.com',
      senha: senhaAdmin,
    },
    {
      nome: 'Rommel Carneiro',
      email: 'rommel.carneiro@policia.com',
      senha: senhaDelegado,
    },
    {
      nome: 'Ana Silva',
      email: 'ana.silva@policia.com', 
      senha: senhaInspetor,
    }
  ]);
}

module.exports = { seed };
