const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Initialize SQLite database
const db = new sqlite3.Database('database.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    isChecked BOOLEAN,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES Users (id)
  )`);
});

// Get the secret key from environment variables
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

// Signup endpoint
app.post('/api/users/signup', async (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM Users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      console.error('Error selecting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (row) {
      return res.status(400).json({ error: 'User already exists' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run('INSERT INTO Users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        const token = jwt.sign({ id: this.lastID }, secretKey, { expiresIn: '1h' });
        res.status(201).json({ message: 'User created successfully', token });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Signin endpoint
app.post('/api/users/signin', async (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM Users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      console.error('Error selecting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    try {
      const isPasswordValid = await bcrypt.compare(password, row.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      const token = jwt.sign({ id: row.id }, secretKey, { expiresIn: '1h' });
      res.status(200).json({ message: 'User signed in successfully', token });
    } catch (error) {
      console.error('Error comparing password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Fetch all todos for the authenticated user
app.get('/api/todos', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.all('SELECT * FROM Todos WHERE userId = ?', [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add a new todo for the authenticated user
app.post('/api/todos', authenticateToken, (req, res) => {
  const { text, isChecked } = req.body;
  const userId = req.user.id;
  db.run('INSERT INTO Todos (text, isChecked, userId) VALUES (?, ?, ?)', [text, isChecked, userId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, text, isChecked });
  });
});

// Update an existing todo
app.put('/api/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { text, isChecked } = req.body;
  const userId = req.user.id;
  db.run('UPDATE Todos SET text = ?, isChecked = ? WHERE id = ? AND userId = ?', [text, isChecked, id, userId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, text, isChecked });
  });
});

// Delete a todo
app.delete('/api/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  db.run('DELETE FROM Todos WHERE id = ? AND userId = ?', [id, userId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Deleted successfully' });
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
