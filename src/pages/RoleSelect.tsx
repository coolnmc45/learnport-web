import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';
import { Users, CheckCircle, BookOpen, Shield, Grid3x3 } from 'lucide-react';

const roles: { id: UserRole; name: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    id: 'learner',
    name: 'Learner',
    description: 'Access your portfolio, submit assignments and track your progress',
    icon: <Users className="w-8 h-8" />,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'assessor',
    name: 'Assessor',
    description: 'Mark submissions, provide feedback and manage learner portfolios',
    icon: <CheckCircle className="w-8 h-8" />,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'trainer',
    name: 'Trainer',
    description: 'Deliver training sessions and manage learning resources',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 'iqa',
    name: 'IQA',
    description: 'Internal Quality Assurer – sample and quality assure assessed work',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'eqa',
    name: 'EQA',
    description: 'External Quality Assurer – review centre compliance and portfolios',
    icon: <Grid3x3 className="w-8 h-8" />,
    color: 'from-red-500 to-red-600',
  },
];

export function RoleSelect() {
  const navigate = useNavigate();
  const { user, selectRole } = useAuth();

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleSelectRole = (role: UserRole) => {
    selectRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">LearnPort</h1>
          <p className="text-xl text-gray-600">Learning Portfolio & Assessment Management</p>
          <p className="text-gray-500 mt-2">Select your role to continue</p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleSelectRole(role.id)}
              className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left hover:scale-105"
            >
              <div className="text-gray-400 group-hover:text-blue-600 transition-colors mb-4">
                {role.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{role.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{role.description}</p>
              <div className="mt-4 flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Select Role →
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>LearnPort v1.0 • Learning Portfolio & Assessment Management</p>
        </div>
      </div>
    </div>
  );
}
