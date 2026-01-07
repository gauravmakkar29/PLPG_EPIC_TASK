import { useUser } from '@clerk/clerk-react';

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-600">PLPG Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-secondary-600">
                Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Your Learning Path</h2>
            <p className="text-secondary-600">
              Your personalized roadmap will appear here once you complete the onboarding process.
            </p>
            <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Start Onboarding
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Progress</h3>
              <div className="text-3xl font-bold text-primary-600">0%</div>
              <p className="text-secondary-500 text-sm">Complete your first module</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Time Invested</h3>
              <div className="text-3xl font-bold text-primary-600">0h</div>
              <p className="text-secondary-500 text-sm">Start learning today</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Streak</h3>
              <div className="text-3xl font-bold text-primary-600">0 days</div>
              <p className="text-secondary-500 text-sm">Build your streak</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
