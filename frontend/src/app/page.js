// src/app/page.jsx
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          Habit Recommender System
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover personalized habit suggestions based on your interests using AI-powered insights
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a 
            href="/login" 
            className="px-8 py-4 bg-white hover:bg-gray-50 text-indigo-600 font-medium rounded-xl shadow-md transition-all duration-200"
          >
            Sign In
          </a>
          <a 
            href="/signup" 
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200"
          >
            Create Account
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              title: "Smart Matching",
              desc: "Get AI-powered habit recommendations tailored to your lifestyle"
            },
            {
              title: "Customization",
              desc: "Filter recommendations by difficulty, frequency, and category"
            },
            {
              title: "Progress Tracking",
              desc: "Save habits to your library and monitor your growth"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}