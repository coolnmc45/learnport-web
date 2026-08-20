import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, AlertCircle, FileText, Send } from 'lucide-react';

interface SubmissionForMarking {
  id: number;
  learnerName: string;
  unitCode: string;
  title: string;
  submittedDate: string;
  status: 'pending' | 'marked' | 'referred';
}

const mockSubmissions: SubmissionForMarking[] = [
  {
    id: 1,
    learnerName: 'Alex Johnson',
    unitCode: 'Unit 1',
    title: 'Customer Service Evidence',
    submittedDate: '2024-01-15',
    status: 'pending',
  },
  {
    id: 2,
    learnerName: 'Jordan Smith',
    unitCode: 'Unit 2',
    title: 'Business Administration Report',
    submittedDate: '2024-01-14',
    status: 'pending',
  },
  {
    id: 3,
    learnerName: 'Casey Brown',
    unitCode: 'Unit 1',
    title: 'Communication Skills',
    submittedDate: '2024-01-13',
    status: 'marked',
  },
];

export function MarkingSuite() {
  const { user } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionForMarking | null>(null);
  const [grade, setGrade] = useState<'pass' | 'distinction' | 'refer' | ''>('');
  const [feedback, setFeedback] = useState('');

  if (user?.role !== 'assessor') {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-800">This page is only available for assessors.</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (selectedSubmission && grade) {
      alert(`Submission marked with grade: ${grade}\nFeedback: ${feedback}`);
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
    }
  };

  const pendingCount = mockSubmissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Marking Suite</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-red-600">{pendingCount}</div>
          <p className="text-gray-600 mt-2">Pending Marking</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">
            {mockSubmissions.filter((s) => s.status === 'marked').length}
          </div>
          <p className="text-gray-600 mt-2">Marked</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{mockSubmissions.length}</div>
          <p className="text-gray-600 mt-2">Total Submissions</p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {mockSubmissions.map((submission) => (
          <div
            key={submission.id}
            onClick={() => setSelectedSubmission(submission)}
            className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow ${
              submission.status === 'pending' ? 'border-l-4 border-red-600' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{submission.learnerName}</h3>
                <p className="text-sm text-gray-600">{submission.unitCode}: {submission.title}</p>
                <p className="text-xs text-gray-500 mt-1">Submitted: {submission.submittedDate}</p>
              </div>
              <div className="flex items-center gap-2">
                {submission.status === 'pending' && (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                {submission.status === 'marked' && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Marking Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedSubmission.learnerName}</h3>
                  <p className="text-gray-600">{selectedSubmission.unitCode}: {selectedSubmission.title}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Submission Details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Submitted Document</p>
                    <p className="font-medium text-gray-900">evidence_submission.pdf</p>
                  </div>
                </div>
              </div>

              {/* Grading */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Grade</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['pass', 'distinction', 'refer'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGrade(g)}
                        className={`p-3 rounded-lg border-2 transition-colors capitalize font-medium ${
                          grade === g
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback for the learner..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="iqa-flag"
                    className="w-4 h-4 border-gray-300 rounded"
                  />
                  <label htmlFor="iqa-flag" className="text-sm text-gray-700">
                    Flag for IQA review
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!grade}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Submit Marking
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
