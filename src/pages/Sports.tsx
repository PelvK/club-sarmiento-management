import React, { useState, useMemo } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  DollarSign,
  Users,
  Plus,
} from "lucide-react";
import { useSports } from "../hooks/useSports";
import { useMembers } from "../hooks/useMembers";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { AddSportModal } from "../components/modals/sports/AddSportModal";
import { Sport } from "../types";
import { EditSportModal } from "../components/modals/sports/EditSportModal";
import { SportDetailsModal } from "../components/modals/sports/SportDetailsModal";
import { SportFilters } from "../components/filters/SportFIlters";

const Sports: React.FC = () => {
  const {
    sports,
    loading: loadingSports,
    error: sportsError,
    deleteSport,
    createSport,
    updateSport,
    refreshSports,
  } = useSports();
  const {
    members,
    loading: loadingMembers,
    error: membersError,
  } = useMembers();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [filters, setFilters] = useState({
    name: "",
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredSports = useMemo(() => {
      return sports!.filter((sport) => {
        const nameMatch = sport.name
          .toLowerCase()
          .includes(filters.name.toLowerCase());
        

        return (nameMatch);
      });
    }, [filters, sports]);

  const sportMemberCounts = useMemo(() => {
    const counts: Record<string, { primary: number; secondary: number }> = {};

    sports.forEach((sport) => {
      counts[sport.name] = { primary: 0, secondary: 0 };
    });

    members.forEach((member) => {
      member.sports?.forEach((sport) => {
        if (counts[sport.name]) {
          if (sport.isPrincipal == true) counts[sport.name].primary++;
          else counts[sport.name].secondary++;
        }
      });
    });
    return counts;
  }, [sports, members]);

  const handleCloseModal = () => {
    setSelectedSport(null);
    setShowEditModal(false);
  };

  const handleCreateSport = async (sport: Omit<Sport, "id">) => {
    await createSport(sport);
    await refreshSports();
    setShowAddModal(false);
  };

  const handleDetailClick = (sport: Sport) => {
    setSelectedSport(sport);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedSport(null);
    setShowDetailsModal(false);
  };

  const handleEditClick = (sport: Sport) => {
    setSelectedSport(sport);
    setShowEditModal(true);
  };

  console.log("JE", Date.now());

  const handleSaveSport = async (sport: Sport) => {
    await updateSport(sport);
    await refreshSports();
    setSelectedSport(null);
    setShowEditModal(false);
  };

  if (loadingSports || loadingMembers) return <LoadingSpinner />;
  if (sportsError || membersError)
    return <ErrorMessage message={sportsError || membersError || ""} />;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Disciplinas</h1>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 ">
          <SportFilters filters={filters} onFilterChange={handleFilterChange} />
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-3 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000] transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Agregar Disciplina
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSports.map((sport) => (
          <div key={sport.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {sport.name}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDetailClick(sport)}
                  className="text-green-600 hover:text-green-800 transition-colors"
                  aria-label="Detalles"
                >
                  <Plus className="w-5 h-5" />
                </button>

                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => handleEditClick(sport)}
                >
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
                  <span className="ml-1">
                    {sportMemberCounts[sport.name]?.primary || 0} socios
                  </span>
                </p>
                <p>
                  <span className="font-medium">Secundaria:</span>
                  <span className="ml-1">
                    {sportMemberCounts[sport.name]?.secondary || 0} socios
                  </span>
                </p>
                <p className="font-medium text-[#FFD700]">
                  Total:{" "}
                  {(sportMemberCounts[sport.name]?.primary || 0) +
                    (sportMemberCounts[sport.name]?.secondary || 0)}{" "}
                  socios
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <DollarSign className="w-4 h-4 text-[#FFD700] mr-1" />
                <h3 className="text-sm font-medium text-gray-900">Cuotas</h3>
              </div>
              <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                {sport.quotes &&
                  sport.quotes.map((quote) => (
                    <div key={quote.id} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {quote.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quote.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            ${quote.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {sport.quotes && sport.quotes.length > 3 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Mostrando {sport.quotes.length} cuotas
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddSportModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateSport}
        />
      )}

      {selectedSport && (
        <EditSportModal
          sport={selectedSport}
          isOpen={showEditModal}
          onClose={handleCloseModal}
          onSave={handleSaveSport}
        />
      )}

      {selectedSport && showDetailsModal && (
        <SportDetailsModal
          sport={selectedSport}
          onClose={handleCloseDetailsModal}
          members={members}
          sportMemberCounts={
            sportMemberCounts[selectedSport.name] || {
              primary: 0,
              secondary: 0,
            }
          }
        />
      )}
    </div>
  );
};

export default Sports;
