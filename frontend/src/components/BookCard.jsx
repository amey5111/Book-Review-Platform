// src/components/BookCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  return (
    <div className="border rounded p-4 shadow-sm bg-white">
      <h3 className="text-lg font-semibold">{book.title}</h3>
      <p className="text-sm text-gray-600">by {book.author} — {book.year || 'N/A'}</p>
      <p className="mt-2 text-sm text-gray-700">
        {book.description ? (book.description.length > 120 ? `${book.description.slice(0, 120)}…` : book.description) : 'No description.'}
      </p>
      <div className="mt-3">
        <Link to={`/books/${book._id}`} className="text-blue-600">View details</Link>
      </div>
    </div>
  );
}
