// src/pages/AddEditBook.jsx
import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';

export default function AddEditBook({ isEdit }) {
  const [form, setForm] = useState({ title: '', author: '', description: '', genre: '', year: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        try {
          const { data } = await API.get(`/books/${id}`);
          const b = data.book || data;
          setForm({
            title: b.title || '',
            author: b.author || '',
            description: b.description || '',
            genre: b.genre || '',
            year: b.year || '',
          });
        } catch (err) {
          console.error('Load book failed', err?.response?.data || err.message);
          setErr('Failed to load book for editing');
        }
      })();
    }
  }, [isEdit, id]);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (isEdit && id) {
        await API.put(`/books/${id}`, form);
        alert('Updated');
        navigate(`/books/${id}`);
      } else {
        const { data } = await API.post('/books', form);
        const newBookId = data.book?._id || data._id || data.id;
        alert('Added');
        navigate(newBookId ? `/books/${newBookId}` : '/');
      }
    } catch (err) {
      console.error('Save book failed', err?.response?.data || err.message);
      setErr(err?.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 border rounded">
      <h2 className="text-2xl mb-4">{isEdit ? 'Edit Book' : 'Add Book'}</h2>
      {err && <div className="mb-3 text-red-600">{err}</div>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm">Author</label>
          <input name="author" value={form.author} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm">Published Year</label>
          <input name="year" value={form.year} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm">Genre</label>
          <input name="genre" value={form.genre} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Saving...' : (isEdit ? 'Update Book' : 'Add Book')}
          </button>
        </div>
      </form>
    </div>
  );
}
