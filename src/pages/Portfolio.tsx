import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface PortfolioUnit {
  id: number;
  code: string;
  title: string;
  progress: number;
  submissions: number;
  status: 'in-progress' | 'completed' | 'referred';
}

const mockUnits: PortfolioUnit[] = [
  {
    id: 1,
    code: 'Unit 1',
    title: 'Customer Service',
    progress: 80,
    submissions: 3,
    status: 'in-progress',
  },
  {
    id: 2,
    code: 'Unit 2',
    title: 'Business Administration',
    progress: 100,
    submissions: 5,
    status: 'completed',
  },
  {
    id: 3,
    code: 'Unit 3',
    title: 'Communication',
    progress: 40,
    submissions: 2,
    status: 'in-progress',
  },
];

export function Portfolio() {
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<PortfolioUnit | null>(null);

  if (user?.role !== 'learner') {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-800">This page is only available for learners.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Portfolio</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Upload className="w-4 h-4" />
          Upload Evidence
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{mockUnits.length}</div>
          <p className="text-gray-600 mt-2">Total Units</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">
            {mockUnits.filter((u) => u.status === 'completed').length}
          </div>
          <p className="text-gray-600 mt-2">Completed</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-amber-600">
            {mockUnits.reduce((sum, u) => sum + u.submissions, 0)}
          </div>
          <p className="text-gray-600 mt-2">Total Submissions</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">
            {Math.round(mockUnits.reduce((sum, u) => sum + u.progress, 0) / mockUnits.length)}%
          </div>
          <p className="text-gray-600 mt-2">Overall Progress</p>
        </div>
      </div>

      {/* Units List */}
      <div className="space-y-4">
        {mockUnits.map((unit) => (
          <div
            key={unit.id}
            onClick={() => setSelectedUnit(unit)}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{unit.code}: {unit.title}</h3>
                <p className="text-sm text-gray-600">{unit.submissions} submissions</p>
              </div>
              <div className="flex items-center gap-2">
                {unit.status === 'completed' && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                {unit.status === 'referred' && (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${unit.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{unit.progress}% complete</p>
          </div>
        ))}
      </div>

      {/* Unit Detail Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedUnit.code}: {selectedUnit.title}
                </h3>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-bold text-gray-900 capitalize">{selectedUnit.status}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="font-bold text-gray-900">{selectedUnit.progress}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Recent Submissions</h4>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Submission {i}</p>
                          <p className="text-sm text-gray-600">Submitted 2 days ago</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          Marked
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
