import React, { useState, useEffect } from "react";
import { X, DollarSign, Check, Pencil } from "lucide-react";
import { Sport } from "../../../../lib/types/sport";
import { QuoteEditData } from "../types";
import "./styles.css";
import { AppButton } from "../../../common/AppButton/component";

interface EditSportModalProps {
  sport: Sport | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (sport: Sport) => Promise<void>;
}

export const EditSportModal: React.FC<EditSportModalProps> = ({
  sport,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Sport>>({});
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [editingQuote, setEditingQuote] = useState<QuoteEditData | null>(null);
  const [quotes, setQuotes] = useState<QuoteEditData[]>([]);
  const [newQuote, setNewQuote] = useState<QuoteEditData>({
    name: "",
    price: 0,
    description: "",
    duration: 1,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log("Loaded sport for editing:", sport);
    if (sport) {
      setFormData({
        id: sport.id,
        name: sport.name,
        description: sport.description,
      });
      setQuotes(sport.quotes || []);
    }
  }, [sport]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleAddQuote = () => {
    if (!newQuote.name || newQuote.price < 0) {
      alert("Por favor complete los campos requeridos de la cuota");
      return;
    }

    setQuotes((prev) => [...prev, { ...newQuote }]);

    setNewQuote({
      name: "",
      price: 0,
      description: "",
      duration: 1,
    });
  };

  const handleRemoveQuote = (index: number) => {
    const quoteToRemove = quotes[index];
    if (quoteToRemove.participants && quoteToRemove.participants > 0) {
      alert("No se puede eliminar una cuota que tiene asociados");
      return;
    }
    setQuotes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditQuote = (quote: QuoteEditData) => {
    setEditingQuoteId(quote.id!);
    setEditingQuote({ ...quote });
  };

  const handleSaveQuoteEdit = () => {
    if (!editingQuote || !editingQuote.name || editingQuote.price < 0) {
      alert("Por favor complete los campos requeridos de la cuota");
      return;
    }

    setQuotes((prev) =>
      prev.map((quote) => (quote.id === editingQuoteId ? editingQuote : quote))
    );

    setEditingQuoteId(null);
    setEditingQuote(null);
  };

  const handleCancelQuoteEdit = () => {
    setEditingQuoteId(null);
    setEditingQuote(null);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setFormData({});
      setQuotes([]);
      setEditingQuoteId(null);
      setEditingQuote(null);
      setNewQuote({
        name: "",
        price: 0,
        description: "",
        duration: 1,
      });
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sport) return;

    if (quotes.length === 0) {
      alert("Debe agregar al menos una cuota");
      return;
    }

    await onSave({
      ...sport,
      ...formData,
      quotes: quotes,
    } as Sport);

    handleClose();
  };

  if (!sport) return null;

  return (
    <div className={`edit-sport-modal-overlay ${isVisible ? "visible" : "hidden"}`}>
      <div className={`edit-sport-modal-content ${isVisible ? "visible" : "hidden"}`}>
        <div className="edit-sport-modal-header">
          <h2 className="edit-sport-modal-title">Editar Disciplina</h2>
          <button onClick={handleClose} className="edit-sport-modal-close">
            <X className="close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-sport-modal-form">
          {/* Basic Information */}
          <div className="form-section">
            <div className="form-field">
              <label htmlFor="name" className="form-label">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="description" className="form-label">
                Descripción
              </label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>

          {/* Quotes Section */}
          <div className="quotes-section">
            <div className="quotes-section-header">
              <DollarSign className="quotes-section-icon" />
              <h3 className="quotes-section-title">Cuotas</h3>
            </div>

            {/* Existing Quotes List */}
            {quotes.length > 0 && (
              <div className="existing-quotes-container">
                <h4 className="existing-quotes-title">Cuotas Actuales</h4>
                <div className="existing-quotes-list">
                  {quotes.map((quote, index) => (
                    <div key={quote.id} className="quote-item">
                      {editingQuoteId === quote.id ? (
                        // Edit mode
                        <div className="quote-edit-mode">
                          <div className="quote-edit-grid">
                            <div className="form-field-small">
                              <label className="form-label-small">Nombre</label>
                              <input
                                type="text"
                                value={editingQuote?.name || ""}
                                onChange={(e) =>
                                  setEditingQuote((prev) =>
                                    prev ? { ...prev, name: e.target.value } : null
                                  )
                                }
                                className="form-input-small"
                              />
                            </div>
                            <div className="form-field-small">
                              <label className="form-label-small">Precio</label>
                              <input
                                type="number"
                                value={editingQuote?.price || 0}
                                onChange={(e) =>
                                  setEditingQuote((prev) =>
                                    prev
                                      ? { ...prev, price: parseFloat(e.target.value) }
                                      : null
                                  )
                                }
                                className="form-input-small"
                                min="0"
                                step="50"
                              />
                            </div>
                            <div className="form-field-small">
                              <label className="form-label-small">
                                Duración (meses)
                              </label>
                              <input
                                type="number"
                                value={editingQuote?.duration || 1}
                                onChange={(e) =>
                                  setEditingQuote((prev) =>
                                    prev
                                      ? { ...prev, duration: parseInt(e.target.value) }
                                      : null
                                  )
                                }
                                className="form-input-small"
                                min="1"
                              />
                            </div>
                          </div>
                          <div className="form-field-small">
                            <label className="form-label-small">Descripción (opcional)</label>
                            <input
                              type="text"
                              value={editingQuote?.description || ""}
                              onChange={(e) =>
                                setEditingQuote((prev) =>
                                  prev
                                    ? { ...prev, description: e.target.value }
                                    : null
                                )
                              }
                              className="form-input-small"
                            />
                          </div>
                          <div className="quote-edit-actions">
                            <button
                              type="button"
                              onClick={handleCancelQuoteEdit}
                              className="quote-cancel-button"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveQuoteEdit}
                              className="quote-save-button"
                            >
                              <Check className="button-icon-small" />
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="quote-view-mode">
                          <div className="quote-info">
                            <div className="quote-name">{quote.name}</div>
                            <div className="quote-description">
                              {quote.description}
                            </div>
                            <div className="quote-details">
                              ${quote.price} - {quote.duration}{" "}
                              {quote.duration === 1 ? "mes" : "meses"}
                            </div>
                            <div className="quote-participants">
                              miembros asociados: {quote.participants || 0}
                            </div>
                          </div>
                          <div className="quote-actions">
                            <button
                              type="button"
                              onClick={() => handleEditQuote(quote)}
                              className="quote-edit-button"
                              title="Editar cuota"
                            >
                              <Pencil className="action-icon-small" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuote(index)}
                              className="quote-delete-button"
                              title="Eliminar cuota"
                            >
                              <X className="action-icon-small" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Quote Form */}
            <div className="new-quote-form">
              <h4 className="new-quote-title">Agregar Nueva Cuota</h4>
              <div className="new-quote-grid">
                <div className="form-field">
                  <label htmlFor="quoteName" className="form-label">
                    Nombre de la Cuota
                  </label>
                  <input
                    type="text"
                    id="quoteName"
                    value={newQuote.name}
                    onChange={(e) =>
                      setNewQuote((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="quotePrice" className="form-label">
                    Precio
                  </label>
                  <input
                    type="number"
                    id="quotePrice"
                    value={newQuote.price}
                    onChange={(e) =>
                      setNewQuote((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value),
                      }))
                    }
                    className="form-input"
                    min="0"
                    step="50.00"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="quoteDuration" className="form-label">
                    Duración (meses)
                  </label>
                  <input
                    type="number"
                    id="quoteDuration"
                    value={newQuote.duration}
                    onChange={(e) =>
                      setNewQuote((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value),
                      }))
                    }
                    className="form-input"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="quoteDescription" className="form-label">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  id="quoteDescription"
                  value={newQuote.description}
                  onChange={(e) =>
                    setNewQuote((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="form-input"
                />
              </div>

              <div className="add-quote-button-container">
                <AppButton
                  type="button"
                  label="Agregar Cuota"
                  onClick={handleAddQuote}
                >
                </AppButton>
              </div>
            </div>
          </div>

          <div className="action-add-modal-button">
            <AppButton label='Cancelar' variant='secondary' type="button" onClick={onClose}>
            </AppButton>
            <AppButton label='Guardar Cambios' type="submit">
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
};
