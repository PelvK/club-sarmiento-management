import React, { useState, useMemo } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  DollarSign,
  Users,
  Trophy,
  Eye,
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
import { CONSOLE_LOG, SHOW_STATS } from "../../lib/utils/consts";
import { AppButton } from "../../components/common/AppButton/component";

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
    refreshSports();
    setShowEditModal(false);
  };

  const handleCreateSport = async (sport: Omit<Sport, "id">) => {
    if (CONSOLE_LOG) {
      console.log("Creating sport:", sport);
    }
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

  const totalMembers = useMemo(() => {
    return Object.values(sportMemberCounts).reduce(
      (acc, counts) => acc + counts.primary + counts.secondary,
      0,
    );
  }, [sportMemberCounts]);

  const totalPrimaryMembers = useMemo(() => {
    return Object.values(sportMemberCounts).reduce(
      (acc, counts) => acc + counts.primary,
      0,
    );
  }, [sportMemberCounts]);

  if (loadingSports || loadingMembers) return <LoadingSpinner />;
  if (sportsError || membersError)
    return <ErrorMessage message={sportsError || membersError || ""} />;

  return (
    <div className="disciplines-container">
      <div className="disciplines-hero-section">
        <div className="disciplines-hero-header">
          <div className="disciplines-hero-info">
            <h1 className="disciplines-hero-title">Disciplinas Deportivas</h1>
            <p className="disciplines-hero-subtitle">
              Gestiona las disciplinas y cuotas del club
            </p>
          </div>
          <div className="disciplines-action-buttons">
            <AppButton
              onClick={() => setShowAddModal(true)}
              label={"Agregar Disciplina"}
              startIcon={<PlusCircle className="disciplines-btn-icon" />}
            />
            <AppButton
              onClick={() => setShowQuoteModal(true)}
              variant="secondary"
              label="Cuotas Societarias"
              startIcon={<DollarSign className="disciplines-btn-icon" />}
            />
          </div>
        </div>
        {SHOW_STATS && (
          <div className="disciplines-stats-grid">
            <div className="disciplines-stat-card disciplines-stat-card-trophy">
              <div className="disciplines-stat-icon">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="disciplines-stat-content">
                <p className="disciplines-stat-label">Total Disciplinas</p>
                <p className="disciplines-stat-value">{sports.length}</p>
              </div>
            </div>

            <div className="disciplines-stat-card disciplines-stat-card-members">
              <div className="disciplines-stat-icon">
                <Users className="w-6 h-6" />
              </div>
              <div className="disciplines-stat-content">
                <p className="disciplines-stat-label">Socios Inscriptos</p>
                <p className="disciplines-stat-value">{totalMembers}</p>
              </div>
            </div>

            <div className="disciplines-stat-card disciplines-stat-card-primary">
              <div className="disciplines-stat-icon">
                <Users className="w-6 h-6" />
              </div>
              <div className="disciplines-stat-content">
                <p className="disciplines-stat-label">
                  Disciplinas Principales
                </p>
                <p className="disciplines-stat-value">{totalPrimaryMembers}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="disciplines-filters-wrapper">
        <SportFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {sports && sports.length === 0 && (
        <div className="disciplines-empty-state">
          <p className="disciplines-empty-text">
            No hay disciplinas disponibles. Por favor, agrega una nueva
            disciplina.
          </p>
        </div>
      )}
      {sports.length !== 0 && filteredSports && filteredSports.length === 0 && (
        <div className="disciplines-empty-state">
          <p className="disciplines-empty-text">
            No hay disciplinas que coincidan con los filtros aplicados.
          </p>
        </div>
      )}

      <div className="disciplines-cards-grid">
        {filteredSports.map((sport) => (
          <div key={sport.id} className="discipline-item-card">
            <div className="discipline-card-top">
              <h2 className="discipline-card-name">{sport.name}</h2>
              <div className="discipline-card-controls">
                <button
                  onClick={() => handleDetailClick(sport)}
                  className="discipline-control-btn discipline-control-btn-view"
                  aria-label="Detalles"
                  title="Ver detalles"
                >
                  <Eye className="discipline-control-icon" />
                </button>

                <button
                  className="discipline-control-btn discipline-control-btn-edit"
                  onClick={() => handleEditClick(sport)}
                  title="Editar"
                >
                  <Pencil className="discipline-control-icon" />
                </button>

                <button
                  onClick={() => deleteSport(sport.id)}
                  className="discipline-control-btn discipline-control-btn-delete"
                  title="Eliminar"
                >
                  <Trash2 className="discipline-control-icon" />
                </button>
              </div>
            </div>

            <p className="discipline-card-description">{sport.description}</p>

            <div className="discipline-members-info">
              <Users className="discipline-members-icon" />
              <div className="discipline-members-data">
                <div className="discipline-member-row">
                  <span className="discipline-member-label">Principal:</span>
                  <span className="discipline-member-count">
                    {sportMemberCounts[sport.name]?.primary || 0} socios
                  </span>
                </div>
                <div className="discipline-member-row">
                  <span className="discipline-member-label">Secundaria:</span>
                  <span className="discipline-member-count">
                    {sportMemberCounts[sport.name]?.secondary || 0} socios
                  </span>
                </div>
                <div className="discipline-member-row discipline-member-total">
                  <span className="discipline-member-label">Total:</span>
                  <span className="discipline-member-count">
                    {(sportMemberCounts[sport.name]?.primary || 0) +
                      (sportMemberCounts[sport.name]?.secondary || 0)}{" "}
                    socios
                  </span>
                </div>
              </div>
            </div>

            <div className="discipline-quotes-area">
              <div className="discipline-quotes-header">
                <DollarSign className="discipline-quotes-icon" />
                <h3 className="discipline-quotes-title">Cuotas</h3>
              </div>
              <div className="discipline-quotes-container">
                {sport.quotes &&
                  sport.quotes.map((quote) => (
                    <div key={quote.id} className="discipline-quote-box">
                      <div className="discipline-quote-layout">
                        <div className="discipline-quote-info">
                          <div className="discipline-quote-name">
                            {quote.name}
                          </div>
                          <div className="discipline-quote-desc">
                            {quote.description}
                          </div>
                        </div>
                        <div className="discipline-quote-amount">
                          <div className="discipline-quote-price">
                            ${quote.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {sport.quotes && sport.quotes.length > 3 && (
                <p className="discipline-quotes-footer">
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
