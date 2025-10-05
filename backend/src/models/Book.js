// src/models/Book.js
const mongoose = require('mongoose');


const bookSchema = new mongoose.Schema({
title: { type: String, required: true, trim: true },
author: { type: String, required: true, trim: true },
description: { type: String, default: '' },
genre: { type: String, default: '' },
year: { type: Number },
addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
averageRating: { type: Number, default: 0 },
reviewsCount: { type: Number, default: 0 }
}, { timestamps: true });


// Virtual populate for reviews (Phase 4 will provide the Review model)
bookSchema.virtual('reviews', {
ref: 'Review', // The model to use
localField: '_id',
foreignField: 'bookId',
justOne: false
});


// Include virtuals when converting to JSON
bookSchema.set('toObject', { virtuals: true });
bookSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('Book', bookSchema);