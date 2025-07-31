// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const dbPromise = require("./database"); // Imports your new database.js

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// --- API Endpoints ---
// We wrap our routes in a function that receives the db instance
async function setupRoutes() {
  const db = await dbPromise;
  // Add a new root route for the base URL
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "Welcome to the E-commerce API!",
      endpoints: {
        list_all_products: "/api/products",
        get_user_by_id: "/api/users/{id}",
      },
    });
  });

  app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from the server with SQLite!" });
  });

  // GET all products with optional category filter
  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      let sql = "SELECT id, name, category, brand, retail_price FROM products";
      const params = [];

      if (category) {
        sql += " WHERE category = ?";
        params.push(category);
      }

      sql += " LIMIT 50";

      const rows = await db.all(sql, params);
      res.json(rows);
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // GET a single user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sql =
        "SELECT id, first_name, last_name, email, city, country, traffic_source FROM users WHERE id = ?";
      const row = await db.get(sql, [id]);

      if (row) {
        res.json(row);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      console.error(`Error fetching user ${req.params.id}:`, err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- Server Start ---
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

setupRoutes();
