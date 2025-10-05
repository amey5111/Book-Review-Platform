// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await signup(form);
    if (res.ok) {
      navigate('/');
    } else {
      setError(res.error || 'Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded">
      <h2 className="text-2xl mb-4">Create account</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <button className="w-full p-2 bg-blue-600 text-white rounded" type="submit">Sign up</button>
      </form>
    </div>
  );
}