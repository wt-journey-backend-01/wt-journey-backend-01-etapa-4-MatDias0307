async function seed(knex) {
  await knex("casos").del();
  await knex("casos").insert([
    { titulo: "Desaparecimento", descricao: "Desaparecimento de eposa do filho do prefeito.", status: "aberto", agente_id: 1 },
    { titulo: "Operação Vagalume", descricao: "Desaparecimento de documentos relevantes.", status: "solucionado", agente_id: 2 },
  ]);
}

module.exports = { seed };