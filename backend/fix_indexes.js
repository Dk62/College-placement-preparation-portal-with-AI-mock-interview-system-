require('dotenv').config();
const mysql = require('mysql2/promise');

async function fix() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST || process.env.DB_HOST,
      port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
      user: process.env.MYSQLUSER || process.env.DB_USER,
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
      database: process.env.MYSQLDATABASE || process.env.DB_NAME
    });

    const [rows] = await connection.query("SHOW INDEX FROM Users");
    
    // Group indexes by column name
    const emailIndexes = rows.filter(r => r.Column_name === 'email' && r.Key_name !== 'PRIMARY');
    const phoneIndexes = rows.filter(r => r.Column_name === 'phone' && r.Key_name !== 'PRIMARY');

    console.log(`Found ${emailIndexes.length} indexes on 'email'`);
    console.log(`Found ${phoneIndexes.length} indexes on 'phone'`);

    for (let i = 0; i < emailIndexes.length; i++) {
        await connection.query(`ALTER TABLE Users DROP INDEX \`${emailIndexes[i].Key_name}\``);
        console.log(`Dropped index ${emailIndexes[i].Key_name}`);
    }

    for (let i = 0; i < phoneIndexes.length; i++) {
        await connection.query(`ALTER TABLE Users DROP INDEX \`${phoneIndexes[i].Key_name}\``);
        console.log(`Dropped index ${phoneIndexes[i].Key_name}`);
    }
    
    await connection.end();
    console.log("Indexes fixed successfully. You can safely restart the backend.");
  } catch(e) {
    console.error(e);
  }
}
fix();
