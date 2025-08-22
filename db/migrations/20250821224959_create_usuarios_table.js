exports.up = function(knex) {
    return knex.schema.createTable('usuarios', function(table) {
      table.increments('id').primary();
      table.string('nome', 100).notNullable();
      table.string('email', 150).notNullable().unique();
      table.string('senha', 255).notNullable();
      table.timestamps(true, true);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('usuarios');
  };