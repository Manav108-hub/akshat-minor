import { useEffect, useState } from 'react';
import axios from 'axios';

export default function HabitsList() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await axios.get('http://localhost:8000/habits', {
          withCredentials: true
        });
        setHabits(response.data);
      } catch (error) {
        console.error('Error fetching habits:', error);
      }
    };

    fetchHabits();
  }, []);

  const handleCheckIn = async (habitId) => {
    try {
      const response = await axios.post(`http://localhost:8000/check-in/${habitId}`, {}, {
        withCredentials: true
      });
      setHabits(prev => prev.map(habit => 
        habit.id === habitId ? { ...habit, current_streak: response.data.current_streak } : habit
      ));
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Failed to mark as done.');
    }
  };

  return (
    <div>
      {habits.length === 0 ? (
        <p>No habits found. Create one!</p>
      ) : (
        <ul className="space-y-4">
          {habits.map((habit) => (
            <li key={habit.id} className="bg-indigo-50 p-4 rounded-md">
              <h4 className="text-lg font-medium">{habit.name}</h4>
              <p>{habit.description}</p>
              <p>Streak: {habit.current_streak} days</p>
              <button
                onClick={() => handleCheckIn(habit.id)}
                className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
              >
                Mark as Done
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}