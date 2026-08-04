const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_this';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create deals table
  db.run(`
    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      stage TEXT DEFAULT 'Lead',
      value REAL DEFAULT 0,
      customer_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create activities table
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      deal_id INTEGER,
      type TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (deal_id) REFERENCES deals(id)
    )
  `);
});

// Helper function to run database query
function runDb(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getDb(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allDb(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await runDb(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await getDb('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getDb('SELECT id, email, username, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all deals
app.get('/api/deals', authenticateToken, async (req, res) => {
  try {
    const deals = await allDb('SELECT * FROM deals WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create deal
app.post('/api/deals', authenticateToken, async (req, res) => {
  try {
    const { title, stage, value, customer_name } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title required' });
    }

    const result = await runDb(
      'INSERT INTO deals (user_id, title, stage, value, customer_name) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, stage || 'Lead', value || 0, customer_name || '']
    );

    res.status(201).json({ id: result.lastID, message: 'Deal created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update deal
app.put('/api/deals/:id', authenticateToken, async (req, res) => {
  try {
    const { title, stage, value, customer_name } = req.body;

    await runDb(
      'UPDATE deals SET title = ?, stage = ?, value = ?, customer_name = ? WHERE id = ? AND user_id = ?',
      [title, stage, value, customer_name, req.params.id, req.user.id]
    );

    res.json({ message: 'Deal updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete deal
app.delete('/api/deals/:id', authenticateToken, async (req, res) => {
  try {
    await runDb('DELETE FROM deals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Deal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add activity
app.post('/api/activities', authenticateToken, async (req, res) => {
  try {
    const { deal_id, type, description } = req.body;

    await runDb(
      'INSERT INTO activities (user_id, deal_id, type, description) VALUES (?, ?, ?, ?)',
      [req.user.id, deal_id, type, description]
    );

    res.status(201).json({ message: 'Activity logged' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activities
app.get('/api/activities/:deal_id', authenticateToken, async (req, res) => {
  try {
    const activities = await allDb(
      'SELECT * FROM activities WHERE deal_id = ? AND user_id = ? ORDER BY created_at DESC',
      [req.params.deal_id, req.user.id]
    );
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 SalesFlow server running on port ${PORT}`);
});
