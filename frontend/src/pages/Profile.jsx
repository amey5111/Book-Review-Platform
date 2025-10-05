// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const [myBooks, setMyBooks] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyContent = async () => {
    setLoading(true);
    try {
      if (!user?._id) return;

      // ✅ Fetch books added by this user
      const { data: booksData } = await API.get(`/books?addedBy=${user._id}&page=1`);
      const books = booksData.books || [];

      // ✅ Fetch reviews written by this user (you must have backend route /reviews/user/:id)
      const { data: reviewsData } = await API.get(`/reviews/user/${user._id}`);
      const reviews = reviewsData.reviews || [];
      console.log("reviews:",reviews);

      setMyBooks(books);
      setMyReviews(reviews);
    } catch (err) {
      console.error('Profile load error', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMyContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return <div>Login to view profile.</div>;
  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-sm text-gray-600">Name: {user.name}</p>
      <p className="text-sm text-gray-600">Email: {user.email}</p>

      {/* My Books */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">My Books</h2>
        {myBooks.length === 0 ? (
          <p>No books added yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 mt-2">
            {myBooks.map((b) => (
              <div key={b._id} className="border p-3 rounded bg-white shadow-sm">
                <h3 className="font-semibold">{b.title}</h3>
                <p className="text-sm text-gray-700">by {b.author}</p>
                <div className="mt-2">
                  <Link to={`/books/${b._id}`} className="text-blue-600 hover:underline">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Reviews */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">My Reviews</h2>
        {myReviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="space-y-3 mt-2">
            {myReviews.map((r) => (
              <div key={r._id} className="border p-3 rounded bg-white shadow-sm">
                <div className="flex justify-between">
                  <strong>{r.bookId?.title || 'Unknown Book'}</strong>
                  <span>{r.rating} ⭐</span>
                </div>
                <p className="mt-2 text-gray-700">{r.reviewText}</p>
                <div className="mt-2 text-sm">
                  <Link to={`/books/${r.bookId?._id}`} className="text-blue-600 hover:underline">
                    Open Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
