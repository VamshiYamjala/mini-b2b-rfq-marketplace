const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const dbName = process.env.DB_NAME || 'b2b_rfq_db';
  console.log(`Ensuring database ${dbName} exists...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.query(`USE \`${dbName}\`;`);

  console.log('Applying schema from db.sql...');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'db.sql'), 'utf8');
  await connection.query(schemaSql);

  console.log('Applying seed data from seed.sql...');
  const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  await connection.query(seedSql);

  console.log('Migration & seed completed successfully!');
  await connection.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});