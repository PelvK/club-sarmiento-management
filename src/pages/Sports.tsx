import React from 'react';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useSports } from '../hooks/useSports';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

const Sports: React.FC = () => {
  const { sports, loading, error, deleteSport } = useSports();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sports</h1>
        <button className="flex items-center px-4 py-2 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000] transition-colors">
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Sport
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports.map((sport) => (
          <div key={sport.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900">{sport.name}</h2>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => deleteSport(sport.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-gray-600">{sport.description}</p>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-500">Max Members:</span>
              <span className="ml-2 text-sm font-medium text-gray-900">{sport.maxMembers}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sports;