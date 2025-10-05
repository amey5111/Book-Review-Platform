// src/pages/BookDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import ReviewForm from "../components/ReviewForm";
import ConfirmDialog from "../components/ConfirmDialog";

const BookDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // For confirm delete dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        setBook(res.data.book);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleDeleteClick = (reviewId) => {
    setPendingDeleteId(reviewId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/reviews/${pendingDeleteId}`);
      setBook({
        ...book,
        reviews: book.reviews.filter((r) => r._id !== pendingDeleteId),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!book) return <p>Book not found</p>;

  return (
    <div className="max-w-3xl mx-auto ">
      <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
      <p className="text-gray-700 ">
        <span className="font-semibold">Author:</span> {book.author}
      </p>
      <p className="text-gray-700 ">
        <span className="font-semibold">Genre:</span> {book.genre}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Published Year:</span> {book.year}
      </p>
      <p className="text-gray-700">Description:</p>
      <p className="mt-3 text-gray-800">{book.description}</p>

      {/* Average Rating */}
      <p className="mt-4 font-semibold">
        Average Rating:{" "}
        {book.reviews && book.reviews.length > 0
          ? (
              book.reviews.reduce((acc, r) => acc + r.rating, 0) /
              book.reviews.length
            ).toFixed(1)
          : "No reviews yet"}
      </p>

      {/* Add Review Form */}
      {user && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Add a Review</h3>
          <ReviewForm bookId={book._id} onReviewAdded={setBook} />
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Reviews</h3>
        {book.reviews && book.reviews.length > 0 ? (
          book.reviews.map((review) => (
            <div
              key={review._id}
              className="border rounded p-3 mb-3 bg-white"
            >
              <p className="font-semibold">
                {review.userId?.name || "Anonymous"} - {review.rating}⭐
              </p>
              <p className="text-gray-700">
                {review.reviewText}
              </p>

              {user && user.id === review.userId?._id && (
                <div className="flex gap-3 mt-2">
                  <Link
                    to={`/edit-review/${review._id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(review._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No reviews yet</p>
        )}
      </div>

      {/* ConfirmDialog */}
      {confirmOpen && (
        <ConfirmDialog
          message="Are you sure you want to delete this review?"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default BookDetails;
