// components/AuthForm.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const endpoint = mode === 'login' ? '/login' : '/signup';
    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (mode === 'login') {
          router.push('/dashboard');
        } else {
          setSuccess('Account created successfully. Please login.');
          setTimeout(() => router.push('/login'), 2000);
        }
      } else {
        setError(data.detail || `${mode === 'login' ? 'Login' : 'Signup'} failed`);
      }
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-100 via-pink-100 to-yellow-100 p-6">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl w-full max-w-md px-8 py-10">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6 tracking-tight">
          {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </h2>

        {error && (
          <p className="text-red-600 text-center mb-4 font-medium bg-red-100 border border-red-200 px-4 py-2 rounded-xl">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-600 text-center mb-4 font-medium bg-green-100 border border-green-200 px-4 py-2 rounded-xl">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-lg shadow-md hover:scale-[1.02] transition-all duration-200 ease-in-out hover:shadow-xl active:scale-95"
          >
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          {mode === 'login' 
            ? "Don't have an account?" 
            : 'Already have an account?'}
          {' '}
          <a 
            href={mode === 'login' ? '/signup' : '/login'} 
            className="text-indigo-600 font-semibold hover:underline"
          >
            {mode === 'login' ? 'Sign up here' : 'Login here'}
          </a>
        </p>
      </div>
    </div>
  );
}