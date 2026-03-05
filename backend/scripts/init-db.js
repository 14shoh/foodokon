const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'foodokon';

async function run() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      multipleStatements: true,
    });
    console.log('✓ Подключение к MySQL успешно');

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const seedPath = path.join(__dirname, '..', 'seed.sql');

    const schema = fs.readFileSync(schemaPath, 'utf8');
    await conn.query(schema);
    console.log('✓ Схема (schema.sql) применена');

    const seed = fs.readFileSync(seedPath, 'utf8');
    const [rows] = await conn.query(seed);
    console.log('✓ Seed (seed.sql) применён');

    const [info] = Array.isArray(rows) ? [rows] : [rows];
    if (Array.isArray(info)) {
      info.forEach((r) => {
        if (r && r.info) console.log('  ', r.info);
      });
    }
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
