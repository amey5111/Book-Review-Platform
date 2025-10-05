const express = require('express');
const router = express.Router();
const {
  addReview,
  updateReview,
  deleteReview,
  getUserReviews, // ✅ new controller
} = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// POST /api/reviews/:bookId
router.post('/reviews/:bookId', auth, addReview);

// PUT /api/reviews/:id
router.put('/reviews/:id', auth, updateReview);

// DELETE /api/reviews/:id
router.delete('/reviews/:id', auth, deleteReview);

// ✅ NEW: GET /api/reviews/user/:userId — fetch all reviews by a user
router.get('/reviews/user/:userId', auth, getUserReviews);

module.exports = router;