import Knex from 'knex';

const tableName = 'points';

export async function up(knex: Knex) {
  return knex.schema.createTable(tableName, table => {
    table.increments('id').primary();
    table.string('image').notNullable().defaultTo(0);
    table.string('name').notNullable().defaultTo(0);
    table.string('email').notNullable().defaultTo(0);
    table.string('whatsapp').notNullable().defaultTo(0);
    table.decimal('latitude').notNullable().defaultTo(0);
    table.decimal('longitude').notNullable().defaultTo(0);
    table.string('city').notNullable().defaultTo(0);
    table.string('uf', 2).notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropSchema(tableName);
}