// src/controllers/bookController.js
const Book = require('../models/Book');
const Review = require('../models/review');
const mongoose = require('mongoose');

// Create a new book (POST /api/books)
exports.createBook = async (req, res) => {
  try {
    const { title, author, description, genre, year } = req.body;
    if (!title || !author)
      return res.status(400).json({ message: 'Title and author are required' });

    const book = await Book.create({
      title,
      author,
      description,
      genre,
      year,
      addedBy: req.user.id, // set by auth middleware
    });

    return res.status(201).json({ book });
  } catch (err) {
    console.error('createBook error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a book (PUT /api/books/:id) — only creator
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid book id' });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.addedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden: not the owner' });

    const updates = (({ title, author, description, genre, year }) => ({
      title,
      author,
      description,
      genre,
      year,
    }))(req.body);

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) book[key] = updates[key];
    });

    await book.save();
    return res.json({ book });
  } catch (err) {
    console.error('updateBook error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a book (DELETE /api/books/:id) — only creator
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid book id' });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.addedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden: not the owner' });

    await book.remove();

    // Also delete reviews for this book
    await Review.deleteMany({ bookId: id });

    return res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error('deleteBook error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get paginated list of books (GET /api/books?page=1&addedBy=<userId>)
exports.getBooks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = 5;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.addedBy && mongoose.Types.ObjectId.isValid(req.query.addedBy)) {
      query.addedBy = req.query.addedBy;
    }

    const [totalBooks, books] = await Promise.all([
      Book.countDocuments(query),
      Book.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('addedBy', 'name email'),
    ]);

    const totalPages = Math.ceil(totalBooks / limit) || 1;

    return res.json({ books, page, totalPages, totalBooks });
  } catch (err) {
    console.error('getBooks error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single book details with reviews populated (GET /api/books/:id)
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid book id' });

    const book = await Book.findById(id).populate('addedBy', 'name email');
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const reviews = await Review.find({ bookId: id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    let averageRating = 0;
    if (reviews.length) {
      averageRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    }

    return res.json({
      book: {
        ...book.toObject(),
        reviews,
        averageRating,
        reviewsCount: reviews.length,
      },
    });
  } catch (err) {
    console.error('getBookById error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
