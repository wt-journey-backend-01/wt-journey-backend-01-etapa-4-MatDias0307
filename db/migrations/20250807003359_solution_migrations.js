async function up(knex) {
  await knex.schema.createTable("agentes", (table) => {
    table.increments("id").primary();
    table.string("nome").notNullable();
    table.date("dataDeIncorporacao").notNullable();
    table.string("cargo").notNullable();
  });

  await knex.schema.createTable("casos", (table) => {
    table.increments("id").primary();
    table.string("titulo").notNullable();
    table.string("descricao").notNullable();
    table.string("status").notNullable();
    table.integer("agente_id").references("id").inTable("agentes").nullable().onDelete("set null");
  });

  await knex.schema.createTable("usuarios", (table) => {
    table.increments("id").primary();
    table.string("nome").notNullable();
    table.string("email").unique().notNullable();
    table.string("senha").notNullable();
  });
}

async function down(knex) {
  await knex.schema.dropTableIfExists("usuarios");
  await knex.schema.dropTableIfExists("casos");
  await knex.schema.dropTableIfExists("agentes");
}

module.exports = {
  up,
  down,
};
