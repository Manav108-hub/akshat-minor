// src/app/recommend/page.jsx
'use client';

import { useState, useEffect } from 'react';
import HabitCard from '@/app/components/HabbitCard';

export default function Recommend() {
  const [inputHabit, setInputHabit] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  
  const popularTags = ['fitness', 'health', 'productivity', 'mindfulness', 'learning', 'finance', 'social'];

  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const generateRecommendations = async (habitTitle, tags = []) => {
    if (!API_KEY) {
      setError("API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Based on the habit "${habitTitle}"${tags.length > 0 ? ` with tags: ${tags.join(', ')}` : ''}, 
                suggest 5 similar or related habits that someone might want to track. 
                Make sure the recommendations are varied, practical, and specific.
                Format your response as a JSON array of objects with:
                - "title": habit name
                - "description": brief explanation
                - "tags": array of relevant tags
                - "similarity": number between 0-1
                - "difficulty": "easy", "medium", or "hard"
                - "frequency": tracking frequency`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024
            }
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "Error generating recommendations");
      }

      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error("Could not parse recommendation data");
      }

      const jsonMatch = textContent.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error("Could not find valid JSON in the response");
      }

      const recommendationsData = JSON.parse(jsonMatch[0]);
      
      const recommendationsWithIds = recommendationsData.map((rec, idx) => ({
        ...rec,
        id: `rec-${Date.now()}-${idx}`
      }));

      setRecommendations(recommendationsWithIds);
      setSuccess(true);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to get recommendations");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputHabit.trim()) return;
    await generateRecommendations(inputHabit, selectedTags);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addHabitToLibrary = async (habit) => {
    try {
      const res = await fetch('/api/habit/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habit)
      });

      if (!res.ok) throw new Error("Failed to save habit");
      
      setSuccess(`"${habit.title}" added to your habit library!`);
    } catch (err) {
      setError(err.message || "Failed to save habit");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Habit Recommender</h1>
          <p className="text-gray-600">Get personalized habit suggestions based on your interests</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="habit-input" className="block text-sm font-medium text-gray-700 mb-2">
                What habit are you interested in?
              </label>
              <input
                id="habit-input"
                type="text"
                value={inputHabit}
                onChange={(e) => setInputHabit(e.target.value)}
                required
                placeholder="E.g. Morning meditation, daily reading, jogging..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select relevant tags (optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                      selectedTags.includes(tag) 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !inputHabit.trim()}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Get Recommendations
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <svg className="h-5 w-5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && !error && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <svg className="h-5 w-5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{typeof success === 'string' ? success : 'Recommendations generated successfully!'}</span>
          </div>
        )}

        {loading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>Generating recommendations...</span>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recommendations for "{inputHabit}"</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((habit) => (
                <HabitCard 
                  key={habit.id} 
                  title={habit.title} 
                  description={habit.description}
                  tags={habit.tags} 
                  score={parseFloat(habit.similarity).toFixed(2)}
                  difficulty={habit.difficulty}
                  frequency={habit.frequency}
                  onAddToLibrary={() => addHabitToLibrary(habit)}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && recommendations.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 12c0-1.104-1.007-2-2.25-2s-2.25.896-2.25 2c0 1.104 1.007 2 2.25 2s2.25-.896 2.25-2zm0 0h.008v.008H9.663V12zm14.334 0a9 9 0 11-18.002 0 9 9 0 0118.002 0zM12 9v3m0 4h.01" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No recommendations yet</h3>
            <p className="text-gray-500">Enter a habit you're interested in and we'll suggest related ones to try!</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Your Saved Habits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">No saved habits yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}