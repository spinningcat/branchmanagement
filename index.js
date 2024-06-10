const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection information
const pool = new Pool({
  user: 'your_username',
  host: 'localhost',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

// Middleware to parse JSON data
app.use(bodyParser.json());

// Endpoint to return the nearest restaurants within a specified radius
app.get('/nearest-restaurants', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query; // Extract latitude, longitude, and radius from the request query

    // SQL query to calculate distance using Haversine formula and filter branches within the specified radius
    const result = await pool.query(`
      SELECT id, name, latitude, longitude,
      (6371 * acos(cos(radians($1)) * cos(radians(latitude)) *
      cos(radians(longitude) - radians($2)) +
      sin(radians($1)) * sin(radians(latitude)))) AS distance
      FROM restaurant_branches
      WHERE (6371 * acos(cos(radians($1)) * cos(radians(latitude)) *
      cos(radians(longitude) - radians($2)) +
      sin(radians($1)) * sin(radians(latitude)))) <= $3 -- Filter branches within the specified radius
      ORDER BY distance LIMIT 5; -- Limit results to the five nearest branches
    `, [latitude, longitude, radius]); // Pass latitude, longitude, and radius as parameters

    // Return the result
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
