async function seed(knex) {
  await knex("agentes").del();
  await knex("agentes").insert([
    {
      nome: "Rommel Carneiro",
      dataDeIncorporacao: "1992-10-04",
      cargo: "delegado"
    },
    {
      nome: "Ana Silva",
      dataDeIncorporacao: "2005-07-15",
      cargo: "inspetor"
    }
  ]);
}

module.exports = { seed };
