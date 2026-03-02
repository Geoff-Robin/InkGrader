const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'dev';");
  console.log('dev schema exists:', res.rows.length > 0);
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'dev';");
  console.log('tables in dev:', tables.rows.map(r => r.table_name));
  await client.end();
}
check();
