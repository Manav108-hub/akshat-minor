import { useState } from 'react';
import axios from 'axios';

export default function HabitForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Sending POST request to /habits");
      const response = await axios.post(
        'http://localhost:8000/habits',
        { name, description },
        {
          withCredentials: true
        }
      );

      console.log("Habit created:", response.data);
      alert('Habit created successfully!');
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating habit:', error.response?.data || error);
      alert('Failed to create habit.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Habit Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
      >
        Create Habit
      </button>
    </form>
  );
}