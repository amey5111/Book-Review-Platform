// controllers/review.controller.js
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Review = require('../models/review');
const Book = require('../models/Book');

// Helper: recalc and update Book's averageRating & reviewsCount
async function updateBookRating(bookId) {
  const stats = await Review.aggregate([
    { $match: { bookId: new mongoose.Types.ObjectId(bookId) } },
    {
      $group: {
        _id: '$bookId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length) {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: stats[0].avgRating,
      reviewsCount: stats[0].count,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: 0,
      reviewsCount: 0,
    });
  }
}

// POST /reviews/:bookId -> add review
const addReview = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { rating, reviewText } = req.body;
  const userId = req.user?.id || req.user?._id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  // Prevent duplicate reviews by same user
  const existing = await Review.findOne({ bookId, userId });
  if (existing) {
    return res.status(400).json({ message: 'You have already reviewed this book' });
  }

  const review = await Review.create({
    bookId,
    userId,
    rating,
    reviewText,
  });

  await updateBookRating(bookId);
  const populated = await review.populate('userId', 'name email');
  res.status(201).json(populated);
});

// PUT /reviews/:id -> edit own review
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, reviewText } = req.body;
  const userId = req.user?.id || req.user?._id;

  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  if (review.userId.toString() !== userId.toString()) {
    return res.status(403).json({ message: 'Not authorized to edit this review' });
  }

  if (rating !== undefined) {
    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be 1-5' });
    review.rating = rating;
  }
  if (reviewText !== undefined) review.reviewText = reviewText;

  await review.save();
  await updateBookRating(review.bookId);

  const populated = await review.populate('userId', 'name email');
  res.json(populated);
});

// DELETE /reviews/:id -> delete own review
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || req.user?._id;

  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  if (review.userId.toString() !== userId.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this review' });
  }

  await Review.findByIdAndDelete(review._id);
  await updateBookRating(review.bookId);

  res.json({ message: 'Review deleted' });
});

// ✅ NEW: GET /reviews/user/:userId -> list all reviews by a specific user
const getUserReviews = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const reviews = await Review.find({ userId })
    .sort({ createdAt: -1 })
    .populate('bookId', 'title author')
    .populate('userId', 'name email');

  res.json({ reviews });
});

module.exports = {
  addReview,
  updateReview,
  deleteReview,
  getUserReviews, // ✅ export new controller
};
