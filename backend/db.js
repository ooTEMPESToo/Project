const mysql = require("mysql2");

// Create a connection pool. This is more efficient than creating a new connection for every query.
const pool = mysql.createPool({
  host: "your_mysql_host",
  user: "your_mysql_user",
  password: "your_mysql_password",
  database: "ecommerce_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export the pool's promise-based interface
module.exports = pool.promise();
