const express = require('express');
const requestLogger = require('./middleware/requestLogger');
const booksRouter = require('./routes/books');

const app = express();

// Parse incoming JSON bodies so route handlers can read req.body
app.use(express.json());

// The logger must be mounted before any routes so it can observe every
// single request that hits the server, including ones that end up as 404s.
app.use(requestLogger);

// Book routes
app.use('/api/books', booksRouter);

// Root health check
app.get('/', (req, res) => {
  res.json({ message: 'Book Management API', version: '1.0.0', status: 'running' });
});

// Catch-all for any route that does not match -- must be the last route defined
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
