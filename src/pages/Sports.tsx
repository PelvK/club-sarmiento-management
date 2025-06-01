import React, { useState, useMemo } from 'react';
import { PlusCircle, Pencil, Trash2, DollarSign, Users } from 'lucide-react';
import { useSports } from '../hooks/useSports';
import { useMembers } from '../hooks/useMembers';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { AddSportModal } from '../components/modals/AddSportModal';

const Sports: React.FC = () => {
  const { sports, loading: loadingSports, error: sportsError, deleteSport, createSport } = useSports();
  const { members, loading: loadingMembers, error: membersError } = useMembers();
  const [showAddModal, setShowAddModal] = useState(false);

  const sportMemberCounts = useMemo(() => {
    const counts: Record<string, { primary: number; secondary: number }> = {};
    
    sports.forEach(sport => {
      counts[sport.name] = { primary: 0, secondary: 0 };
    });

    members.forEach(member => {
      if (counts[member.sport]) {
        counts[member.sport].primary++;
      }
      
      member.secondarySports?.forEach(sport => {
        if (counts[sport]) {
          counts[sport].secondary++;
        }
      });
    });

    return counts;
  }, [sports, members]);

  if (loadingSports || loadingMembers) return <LoadingSpinner />;
  if (sportsError || membersError) return <ErrorMessage message={sportsError || membersError || ''} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Disciplinas</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000] transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Agregar Disciplina
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports.map((sport) => (
          <div key={sport.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
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
            
            <p className="text-gray-600 mb-4">{sport.description}</p>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Users className="w-4 h-4 text-[#FFD700] mr-2" />
              <div>
                <p>
                  <span className="font-medium">Principal:</span>
                  <span className="ml-1">{sportMemberCounts[sport.name]?.primary || 0} socios</span>
                </p>
                <p>
                  <span className="font-medium">Secundaria:</span>
                  <span className="ml-1">{sportMemberCounts[sport.name]?.secondary || 0} socios</span>
                </p>
                <p className="font-medium text-[#FFD700]">
                  Total: {(sportMemberCounts[sport.name]?.primary || 0) + (sportMemberCounts[sport.name]?.secondary || 0)} socios
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <DollarSign className="w-4 h-4 text-[#FFD700] mr-1" />
                <h3 className="text-sm font-medium text-gray-900">Cuotas</h3>
              </div>
              <div className="space-y-2">
                {sport.quotes.map((quote) => (
                  <div key={quote.id} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{quote.name}</div>
                        <div className="text-sm text-gray-500">{quote.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">${quote.price}</div>
                        <div className="text-sm text-gray-500">
                          {quote.duration} {quote.duration === 1 ? 'mes' : 'meses'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddSportModal
          onClose={() => setShowAddModal(false)}
          onSave={createSport}
        />
      )}
    </div>
  );
};

export default Sports;