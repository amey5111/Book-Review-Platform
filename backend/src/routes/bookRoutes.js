// src/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');


// Public listing and details
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);


// Protected actions
router.post('/', auth, bookController.createBook);
router.put('/:id', auth, bookController.updateBook);
router.delete('/:id', auth, bookController.deleteBook);


module.exports = router;