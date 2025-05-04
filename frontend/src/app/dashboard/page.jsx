'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import HabitsList from '@/app/dashboard/HabbitList';
import HabitsForm from '@/app/dashboard/HabbitForm';
import ProgressTracker from '@/app/dashboard/ProgressTracker';
import { User, Clock } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from /me endpoint
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8000/me', {
          withCredentials: true,
        });

        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        alert('Failed to load user.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-2xl font-bold text-indigo-600">Habit Tracker</h2>
          <div className="space-x-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
            >
              Dashboard
            </button>
            <button 
              onClick={async () => {
                await axios.post('http://localhost:8000/logout', {}, {
                  withCredentials: true
                });
                router.push('/login');
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-12 px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 mb-8">
          <h3 className="text-xl font-semibold mb-4">Welcome Back</h3>
          <p className="text-gray-600 mb-6">Email: {user?.email}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-indigo-50 p-6 rounded-xl">
              <User size={32} className="text-indigo-500 mb-2" />
              <h4 className="text-lg font-medium">Account Status</h4>
              <p className="text-green-600 text-2xl font-semibold">Active</p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl">
              <Clock size={32} className="text-indigo-500 mb-2" />
              <h4 className="text-lg font-medium">Last Login</h4>
              <p className="text-gray-600">Just now</p>
            </div>
          </div>
        </div>

        {/* Habit Form */}
        <div className="bg-white shadow-lg rounded-xl p-8 mb-8">
          <h3 className="text-xl font-semibold mb-4">Create New Habit</h3>
          <HabitsForm/>
        </div>

        {/* Habits List */}
        <div className="bg-white shadow-lg rounded-xl p-8 mb-8">
          <h3 className="text-xl font-semibold mb-4">Your Habits</h3>
          <HabitsList />
        </div>

        {/* Progress Tracker */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
          <ProgressTracker />
        </div>
      </main>
    </div>
  );
}