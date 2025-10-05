// src/pages/BookList.jsx
import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { Link, useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard';

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/books?page=${page}`);
        // Accept backend that returns either:
        // { books, page, totalPages } or { data: { books, page, totalPages } }
        const booksList = data.books || data.data?.books || [];
        const currentPage = data.page ?? data.data?.page ?? page;
        const totalPages = data.totalPages ?? data.data?.totalPages ?? 1;
        const total = data.total ?? data.data?.total ?? booksList.length;
        setBooks(booksList);
        setPageInfo({ page: currentPage, totalPages, total });
      } catch (err) {
        console.error('Failed to fetch books', err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page]);

  const goto = (p) => setSearchParams({ page: p });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Books</h1>
        <Link to="/add-book" className="px-3 py-1 bg-blue-600 text-white rounded">Add Book</Link>
      </div>

      {loading ? (
        <div>Loading books...</div>
      ) : books.length === 0 ? (
        <div>No books yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {books.map((b) => <BookCard key={b._id} book={b} />)}
        </div>
      )}

      <div className="flex items-center gap-4 mt-6">
        <button disabled={pageInfo.page <= 1} onClick={() => goto(pageInfo.page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <span>Page {pageInfo.page} / {pageInfo.totalPages}</span>
        <button disabled={pageInfo.page >= pageInfo.totalPages} onClick={() => goto(pageInfo.page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
