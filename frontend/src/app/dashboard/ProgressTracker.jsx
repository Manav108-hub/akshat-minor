import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProgressTracker() {
  const [progress, setProgress] = useState({
    completedToday: 0,
    totalHabits: 0,
  });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axios.get('http://localhost:8000/progress', {
          withCredentials: true
        });
        setProgress(response.data);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();
  }, []);

  return (
    <div>
      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-500 mr-2">
          <path d="M12 2L2 20h20L12 2Z" />
        </svg>
        <p>Habits Completed Today: {progress.completedToday}/{progress.totalHabits}</p>
      </div>
      <div className="bg-gray-200 h-2 rounded-full">
        <div
          className="bg-green-500 h-full"
          style={{ width: `${(progress.completedToday / progress.totalHabits) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}