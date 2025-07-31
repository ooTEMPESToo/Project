// server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db'); // Imports your db.js file

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
// Enable CORS for all routes
app.use(cors());
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// --- API Endpoints ---

// A simple test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// GET all products with optional category filter
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT id, name, category, brand, retail_price FROM products';
    const params = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    
    sql += ' LIMIT 50'; // Limit results for performance

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET a single user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT id, first_name, last_name, email, city, country, traffic_source FROM users WHERE id = ?';
    const [rows] = await db.query(sql, [id]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(`Error fetching user ${req.params.id}:`, err);
    res.status(500).json({ error: 'Database error' });
  }
});


// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
