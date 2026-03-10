const express = require('express');
const router = express.Router();

// Seed data -- real books, kept in memory so the server resets on restart
let books = [
  { id: 1, title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', year: 1960 },
  { id: 2, title: '1984', author: 'George Orwell', genre: 'Dystopian', year: 1949 },
  { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Classic', year: 1925 },
  { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'Non-Fiction', year: 2011 },
];

// Get all books
router.get('/', (req, res) => {
  res.json({ success: true, count: books.length, data: books });
});

// Get a single book by id
router.get('/:id', (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }
  res.json({ success: true, data: book });
});

// Add a new book
router.post('/', (req, res) => {
  const { title, author, genre, year } = req.body;

  if (!title || !author) {
    return res.status(400).json({ success: false, message: 'Title and author are required' });
  }

  const newBook = {
    id: books.length > 0 ? books[books.length - 1].id + 1 : 1,
    title,
    author,
    genre: genre || 'Unknown',
    year: year || null,
  };

  books.push(newBook);
  res.status(201).json({ success: true, message: 'Book added', data: newBook });
});

// Update an existing book
router.put('/:id', (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  // Only update fields that were actually sent in the request body
  if (req.body.title) book.title = req.body.title;
  if (req.body.author) book.author = req.body.author;
  if (req.body.genre) book.genre = req.body.genre;
  if (req.body.year) book.year = req.body.year;

  res.json({ success: true, message: 'Book updated', data: book });
});

// Delete a book
router.delete('/:id', (req, res) => {
  const index = books.findIndex((b) => b.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  books.splice(index, 1);
  res.json({ success: true, message: 'Book deleted' });
});

module.exports = router;
