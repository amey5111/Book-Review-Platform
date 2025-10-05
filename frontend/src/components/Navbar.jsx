// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(!open);
  const closeDropdown = () => setOpen(false);

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100 relative">
      <div>
        <Link to="/" className="font-bold">Bookish : The book review platform</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/">Home</Link>

        {user ? (
          <div className="relative">
            {/* Dropdown Button */}
            <button
              onClick={toggleDropdown}
              className="px-3 py-1 border rounded bg-white hover:bg-gray-50"
            >
              {user.name} ⌄
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div
                className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-10"
                onMouseLeave={closeDropdown}
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={closeDropdown}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeDropdown();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="px-3 py-1 border rounded">Login</Link>
            <Link to="/signup" className="px-3 py-1 border rounded">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
