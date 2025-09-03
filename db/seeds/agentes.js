async function seed(knex) {
  await knex("agentes").del();
  await knex("agentes").insert([
    { nome: "Matheus Dias", dataDeIncorporacao: "2023-05-11", cargo: "Investigador" },
    { nome: "Rommel Carneiro", dataDeIncorporacao: "2022-09-01", cargo: "Delegado" },
  ]);
}

module.exports = { seed };