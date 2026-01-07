import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-600">PLPG</div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link
                to="/sign-in"
                className="px-4 py-2 text-primary-600 hover:text-primary-700"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-secondary-900 mb-6">
            Your Personalized Path to a New Career
          </h1>
          <p className="text-xl text-secondary-600 mb-8">
            PLPG creates custom learning roadmaps to help you transition into your dream tech role.
            Powered by AI, guided by experts.
          </p>
          <SignedOut>
            <Link
              to="/sign-up"
              className="inline-block px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Your Free Trial
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              to="/dashboard"
              className="inline-block px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Personalized Roadmaps</h3>
            <p className="text-secondary-600">
              Get a custom learning path based on your current skills and target role.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Curated Resources</h3>
            <p className="text-secondary-600">
              Access hand-picked learning materials from top providers.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Track Progress</h3>
            <p className="text-secondary-600">
              Monitor your learning journey with detailed analytics and insights.
            </p>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-secondary-200">
        <div className="text-center text-secondary-500">
          © {new Date().getFullYear()} PLPG. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
