import React, { useState, useMemo } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  DollarSign,
  Users,
  Plus,
} from "lucide-react";
import { useSports } from "../../hooks/useSports";
import { useMembers } from "../../hooks/useMembers";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";
import { EditSportModal } from "../../components/modals/sports/editSport";
import { SportDetailsModal } from "../../components/modals/sports/SportDetailsModal";
import { SportFilters } from "../../components/filters/SportFIlters";
import { Sport } from "../../lib/types";
import "./styles.css";
import { AddSportModal } from "../../components/modals/sports";
import { AddSocietaryQuoteModal } from "../../components/modals/sports/addSocietyQuotes";
import { useCuotes } from "../../hooks";
import { SocietaryQuoteFormData } from "../../components/modals/sports/types";

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

  /**
   * @todo NWD-010
   */
  const {
    createSocietaryQuote /* updateSocietaryQuote */ /* deleteSocietaryQuote */,
  } = useCuotes();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [filters, setFilters] = useState({
    name: "",
  });
  /**
   * @todo NWD-010
   */
  // const [showEditQuoteModal, setShowEditQuoteModal] = useState(false);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * @todo NWD-010
   */

  /*   const handleUpdateSocietaryQuotes = async (quotes: QuoteFormData[]) => {
    await updateSocietaryQuote(quotes);
    setShowEditQuoteModal(false);
  };

  const handleDeleteSocietaryQuote = async (quoteId: number) => {
    await deleteSocietaryQuote(quoteId);
  };
 */
  const filteredSports = useMemo(() => {
    return sports!.filter((sport) => {
      const nameMatch = sport.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());

      return nameMatch;
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
    console.log("Creating sport:", sport);
    await createSport(sport);
    await refreshSports();
    setShowAddModal(false);
  };

  const handleCreateSocietaryQuote = async (quote: SocietaryQuoteFormData) => {
    const quoteMapped = quote.quotes.map((q) => ({
      ...q,
      id: Date.now(),
    }));
    quote = { ...quote, quotes: quoteMapped };
    await createSocietaryQuote(quoteMapped);
    setShowQuoteModal(false);
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
    <div className="sports-container">
      <div className="sports-header">
        <h1 className="sports-title">Disciplinas</h1>
        <div className="sports-actions">
          <SportFilters filters={filters} onFilterChange={handleFilterChange} />
          <button
            onClick={() => setShowAddModal(true)}
            className="add-sport-button"
          >
            <PlusCircle className="button-icon" />
            Agregar Disciplina
          </button>
          <button
            onClick={() => setShowQuoteModal(true)}
            className="add-sport-button-secondary-button"
          >
            <PlusCircle className="button-icon" />
            Agregar Cuotas Societarias
          </button>

          {/*     @TODO chequear funcionalidad y añadir apis      

<button
            onClick={() => setShowEditQuoteModal(true)}
            className="add-sport-button-secondary-button"
          >
            <EditIcon className="button-icon" />
            Editar Cuotas Societarias
          </button> */}
        </div>
      </div>

      {sports && sports.length === 0 && (
        <div className="no-element-box">
          <p className="no-element-text">
            No hay disciplinas disponibles. Por favor, agrega una nueva
            disciplina.
          </p>
        </div>
      )}
      {sports.length !== 0 && filteredSports && filteredSports.length === 0 && (
        <div className="no-element-box">
          <p className="no-element-text">
            No hay disciplinas que coincidan con los filtros aplicados.
          </p>
        </div>
      )}

      <div className="sports-grid">
        {filteredSports.map((sport) => (
          <div key={sport.id} className="sport-card">
            <div className="sport-card-header">
              <h2 className="sport-card-title">{sport.name}</h2>
              <div className="sport-card-actions">
                <button
                  onClick={() => handleDetailClick(sport)}
                  className="action-button action-button-details"
                  aria-label="Detalles"
                >
                  <Plus className="action-icon" />
                </button>

                <button
                  className="action-button action-button-edit"
                  onClick={() => handleEditClick(sport)}
                >
                  <Pencil className="action-icon" />
                </button>

                <button
                  onClick={() => deleteSport(sport.id)}
                  className="action-button action-button-delete"
                >
                  <Trash2 className="action-icon" />
                </button>
              </div>
            </div>

            <p className="sport-description">{sport.description}</p>

            <div className="sport-members-section">
              <Users className="members-icon" />
              <div>
                <p className="member-count">
                  <span className="member-label">Principal:</span>
                  <span className="member-value">
                    {sportMemberCounts[sport.name]?.primary || 0} socios
                  </span>
                </p>
                <p className="member-count">
                  <span className="member-label">Secundaria:</span>
                  <span className="member-value">
                    {sportMemberCounts[sport.name]?.secondary || 0} socios
                  </span>
                </p>
                <p className="member-total">
                  Total:{" "}
                  {(sportMemberCounts[sport.name]?.primary || 0) +
                    (sportMemberCounts[sport.name]?.secondary || 0)}{" "}
                  socios
                </p>
              </div>
            </div>

            <div className="sport-quotes-section">
              <div className="quotes-header">
                <DollarSign className="quotes-icon" />
                <h3 className="quotes-title">Cuotas</h3>
              </div>
              <div className="quotes-list">
                {sport.quotes &&
                  sport.quotes.map((quote) => (
                    <div key={quote.id} className="quote-item">
                      <div className="quote-content">
                        <div>
                          <div className="quote-name">{quote.name}</div>
                          <div className="quote-description">
                            {quote.description}
                          </div>
                        </div>
                        <div className="quote-price-container">
                          <div className="quote-price">${quote.price}</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {sport.quotes && sport.quotes.length > 3 && (
                <p className="quotes-count">
                  Mostrando {sport.quotes.length} cuotas
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {/**
       * @todo NWD-010
       */}
      {/* 
      {showEditQuoteModal && (
        <EditSocietaryQuoteModal
          onClose={() => setShowEditQuoteModal(false)}
          onSave={handleUpdateSocietaryQuotes}
          onDelete={handleDeleteSocietaryQuote}
        />
      )} */}

      {showAddModal && (
        <AddSportModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateSport}
        />
      )}

      {showQuoteModal && (
        <AddSocietaryQuoteModal
          onClose={() => setShowQuoteModal(false)}
          onSave={handleCreateSocietaryQuote}
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

export { Sports };
