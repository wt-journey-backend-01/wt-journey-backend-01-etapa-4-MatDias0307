const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  await knex('usuarios').del();

  const senhaAdmin = await bcrypt.hash('Admin123!', 12);
  const senhaDelegado = await bcrypt.hash('Delegado123!', 12);
  const senhaInspetor = await bcrypt.hash('Inspetor123!', 12);

  return knex('usuarios').insert([
    {
      nome: 'Administrador do Sistema',
      email: 'admin@policia.com',
      senha: senhaAdmin,
      created_at: new Date()
    },
    {
      nome: 'Rommel Carneiro',
      email: 'rommel.carneiro@policia.com',
      senha: senhaDelegado,
      created_at: new Date()
    },
    {
      nome: 'Ana Silva',
      email: 'ana.silva@policia.com', 
      senha: senhaInspetor,
      created_at: new Date()
    }
  ]);
};