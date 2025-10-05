// src/components/ReviewForm.jsx
import React, { useState } from 'react';
import API from '../utils/api';

export default function ReviewForm({ bookId, onSuccess, initial = null }) {
  // `initial` can be { rating, reviewText, id } to prefill for editing
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [reviewText, setReviewText] = useState(initial?.reviewText ?? '');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial?.id) {
        // edit existing review
        await API.put(`/reviews/${initial.id}`, { rating, reviewText });
      } else {
        await API.post(`/reviews/${bookId}`, { rating, reviewText });
      }
      setRating(5);
      setReviewText('');
      if (onSuccess) await onSuccess();
    } catch (err) {
      console.error('Review error', err?.response?.data || err.message);
      alert(err?.response?.data?.message || 'Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="border p-3 rounded bg-white">
      <div>
        <label className="block text-sm">Rating</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="p-2 border rounded">
          {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} ⭐</option>)}
        </select>
      </div>

      <div className="mt-2">
        <label className="block text-sm">Review</label>
        <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} required className="w-full p-2 border rounded" />
      </div>

      <div className="mt-2">
        <button type="submit" disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded">{loading ? 'Saving...' : (initial?.id ? 'Update Review' : 'Submit Review')}</button>
      </div>
    </form>
  );
}
