// database.js
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const fs = "fs";
const Papa = "papaparse";
const path = "path";

const DB_FILE = "ecommerce.db";

// --- Database Initialization ---
// This function sets up the database connection and tables.
async function initializeDatabase() {
  const dbExists = fs.existsSync(DB_FILE);
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });

  // If the database file didn't exist, it means we need to create tables and import data.
  if (!dbExists) {
    console.log("First time setup: Creating database and importing data...");
    await setupSchema(db);
    await importAllData(db);
    console.log("Database setup complete.");
  } else {
    console.log("Database already exists. Skipping setup.");
  }
  return db;
}

// --- Schema Creation ---
// Defines the structure of your database tables.
async function setupSchema(db) {
  await db.exec(`
        CREATE TABLE distribution_centers (
            id INT PRIMARY KEY, name TEXT, latitude REAL, longitude REAL
        );
        CREATE TABLE users (
            id INT PRIMARY KEY, first_name TEXT, last_name TEXT, email TEXT, age INT, 
            gender TEXT, state TEXT, street_address TEXT, postal_code TEXT, city TEXT, 
            country TEXT, latitude REAL, longitude REAL, traffic_source TEXT, created_at TEXT
        );
        CREATE TABLE products (
            id INT PRIMARY KEY, cost REAL, category TEXT, name TEXT, brand TEXT, 
            retail_price REAL, department TEXT, sku TEXT, distribution_center_id INT
        );
        CREATE TABLE orders (
            order_id INT PRIMARY KEY, user_id INT, status TEXT, gender TEXT, created_at TEXT, 
            returned_at TEXT, shipped_at TEXT, delivered_at TEXT, num_of_item INT
        );
        CREATE TABLE order_items (
            id INT PRIMARY KEY, order_id INT, user_id INT, product_id INT, inventory_item_id INT, 
            status TEXT, created_at TEXT, shipped_at TEXT, delivered_at TEXT, returned_at TEXT, sale_price REAL
        );
    `);
}

// --- Data Import Logic ---
// Reads a CSV file and inserts its data into a specified table.
async function importCSV(db, filePath, tableName) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const result = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    console.error(`Errors parsing ${filePath}:`, result.errors);
    return;
  }

  const data = result.data;
  if (data.length === 0) return;

  const columns = Object.keys(data[0]);
  const placeholders = columns.map(() => "?").join(",");
  const stmt = await db.prepare(
    `INSERT INTO ${tableName} (${columns.join(",")}) VALUES (${placeholders})`
  );

  await db.run("BEGIN TRANSACTION");
  for (const row of data) {
    const values = columns.map((col) => row[col]);
    await stmt.run(values);
  }
  await db.run("COMMIT");
  await stmt.finalize();
  console.log(`Imported data into ${tableName} from ${filePath}`);
}

// --- Main Import Function ---
// Orchestrates the import process for all CSV files.
async function importAllData(db) {
  // IMPORTANT: Update this path to the directory where your CSV files are located.
  const csvDir = path.join(__dirname, "archive");

  await importCSV(
    db,
    path.join(csvDir, "distribution_centers.csv"),
    "distribution_centers"
  );
  await importCSV(db, path.join(csvDir, "users.csv"), "users");
  await importCSV(db, path.join(csvDir, "products.csv"), "products");
  await importCSV(db, path.join(csvDir, "orders.csv"), "orders");
  await importCSV(db, path.join(csvDir, "order_items.csv"), "order_items");
}

// Export a promise that resolves with the database instance.
module.exports = initializeDatabase();
