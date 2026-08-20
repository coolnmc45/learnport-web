import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardContent = () => {
    switch (user.role) {
      case 'learner':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-blue-600">5</div>
                <p className="text-gray-600 mt-2">Units in Progress</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-green-600">12</div>
                <p className="text-gray-600 mt-2">Submissions Completed</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-amber-600">3</div>
                <p className="text-gray-600 mt-2">Awaiting Feedback</p>
              </div>
            </div>
          </div>
        );
      case 'assessor':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Marking Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-red-600">8</div>
                <p className="text-gray-600 mt-2">Pending Marking</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-green-600">24</div>
                <p className="text-gray-600 mt-2">Marked This Month</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-blue-600">12</div>
                <p className="text-gray-600 mt-2">Assigned Learners</p>
              </div>
            </div>
          </div>
        );
      case 'trainer':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Training Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-blue-600">4</div>
                <p className="text-gray-600 mt-2">Upcoming Sessions</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-purple-600">18</div>
                <p className="text-gray-600 mt-2">Learning Resources</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-green-600">156</div>
                <p className="text-gray-600 mt-2">Total Attendees</p>
              </div>
            </div>
          </div>
        );
      case 'iqa':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Quality Assurance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-orange-600">6</div>
                <p className="text-gray-600 mt-2">Samples to Review</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-green-600">42</div>
                <p className="text-gray-600 mt-2">Samples Approved</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-red-600">3</div>
                <p className="text-gray-600 mt-2">Referred Back</p>
              </div>
            </div>
          </div>
        );
      case 'eqa':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Centre Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-green-600">94%</div>
                <p className="text-gray-600 mt-2">Compliance Score</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-blue-600">12</div>
                <p className="text-gray-600 mt-2">Centres Monitored</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-purple-600">8</div>
                <p className="text-gray-600 mt-2">Reports Generated</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <h1 className="text-2xl font-bold text-gray-900">LearnPort</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {getDashboardContent()}
      </main>
    </div>
  );
}
