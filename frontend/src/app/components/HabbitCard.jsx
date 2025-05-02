// src/app/components/HabitCard.jsx
import { Star, Clock, Tag, PlusCircle } from 'lucide-react';

export default function HabitCard({
  title, 
  description, 
  tags = [], 
  score = 0,
  difficulty = 'medium',
  frequency = 'daily',
  onAddToLibrary = () => {}
}) {
  // Match color calculation
  const getMatchColors = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 0.8) return 'bg-green-100 text-green-800';
    if (numScore >= 0.6) return 'bg-blue-100 text-blue-800';
    if (numScore >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Difficulty indicators
  const difficultyMap = {
    easy: { color: 'text-green-600', stars: 1 },
    medium: { color: 'text-yellow-600', stars: 2 },
    hard: { color: 'text-red-600', stars: 3 }
  };
  const difficultyInfo = difficultyMap[difficulty] || difficultyMap.medium;

  return (
    <div className="bg-white shadow-md rounded-lg p-5 border-l-4 border-indigo-500 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {title}
        </h2>
        <span className={`${getMatchColors(score)} text-xs font-medium px-2.5 py-1 rounded-full`}>
          {Math.round(score * 100)}% Match
        </span>
      </div>

      {description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>
      )}

      <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          {Array.from({ length: difficultyInfo.stars }).map((_, i) => (
            <Star key={i} size={12} className={`fill-current ${difficultyInfo.color}`} />
          ))}
          <span className="ml-1 capitalize">{difficulty}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span className="capitalize">{frequency}</span>
        </div>
      </div>

      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={onAddToLibrary}
        className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
      >
        <PlusCircle size={16} />
        <span>Add to habits</span>
      </button>
    </div>
  );
}