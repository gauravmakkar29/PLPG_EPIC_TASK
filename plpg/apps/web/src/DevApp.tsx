import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from './services/api';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: 'connected' | 'disconnected';
}

function DevDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const response = await api.get('/health');
        setHealth(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to connect to API');
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">PLPG Dashboard</h1>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Dev Mode
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* System Health Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-gray-600">Checking connection...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-red-600">{error}</span>
              </div>
            ) : health ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${health.database === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-gray-700">
                    Database: <span className={health.database === 'connected' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {health.database}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-gray-700">
                    API Status: <span className={health.status === 'healthy' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {health.status}
                    </span>
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  Uptime: {Math.floor(health.uptime / 60)} minutes
                </p>
              </div>
            ) : null}
          </div>

          {/* Dev Mode Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Development Mode</h3>
            <p className="text-yellow-700">
              Running without Clerk authentication. To enable full features, add your Clerk keys to the .env file:
            </p>
            <pre className="mt-2 bg-yellow-100 p-3 rounded text-sm text-yellow-900 overflow-x-auto">
{`VITE_CLERK_PUBLISHABLE_KEY="pk_test_your_key_here"
CLERK_SECRET_KEY="sk_test_your_key_here"`}
            </pre>
          </div>

          {/* Sample Dashboard Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress</h3>
              <div className="text-3xl font-bold text-blue-600">0%</div>
              <p className="text-gray-500 text-sm">Complete your first module</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Invested</h3>
              <div className="text-3xl font-bold text-blue-600">0h</div>
              <p className="text-gray-500 text-sm">Start learning today</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Streak</h3>
              <div className="text-3xl font-bold text-blue-600">0 days</div>
              <p className="text-gray-500 text-sm">Build your streak</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DevApp() {
  return (
    <Routes>
      <Route path="/" element={<DevDashboard />} />
      <Route path="/dashboard" element={<DevDashboard />} />
      <Route path="*" element={<DevDashboard />} />
    </Routes>
  );
}
