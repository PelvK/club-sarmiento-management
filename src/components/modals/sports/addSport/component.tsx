import React, { useState } from "react";
import { X, DollarSign } from "lucide-react";
import { Sport } from "../../../../lib/types/sport";
import { SportFormData, QuoteFormData } from "../types";
import "./styles.css";
import { AppButton } from "../../../common/AppButton/component";

interface AddSportModalProps {
  onClose: () => void;
  onSave: (sport: Omit<Sport, "id">) => Promise<void>;
}

export const AddSportModal: React.FC<AddSportModalProps> = ({
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<SportFormData>({
    name: "",
    description: "",
    quotes: [],
  });

  const [newQuote, setNewQuote] = useState<QuoteFormData>({
    name: "",
    price: 0,
    description: "",
    duration: 1,
  });

  const handleAddQuote = () => {
    if (!newQuote.name) {
      alert("El nombre de la cuota es obligatorio");
    }

    if (newQuote.price < 0) {
      alert("El precio no puede ser negativo");
      return;
    }

    const numericId = Date.now();

    setFormData((prev) => ({
      ...prev,
      quotes: [...prev.quotes, { ...newQuote, id: numericId }],
    }));

    setNewQuote({
      name: "",
      price: 0,
      description: "",
      duration: 1,
    });
  };

  const handleRemoveQuote = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      quotes: prev.quotes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.quotes.length === 0) {
      alert("Debe agregar al menos una cuota");
      return;
    }

    await onSave(formData);
    onClose();
  };

  return (
    <div className="add-sport-modal-overlay">
      <div className="add-sport-modal-content">
        <div className="add-sport-modal-header">
          <h2 className="add-sport-modal-title">Nueva Disciplina</h2>
          <button onClick={onClose} className="add-sport-modal-close">
            <X className="close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-sport-modal-form">
          {/* Basic Information */}
          <div className="form-section">
            <div className="form-field">
              <label htmlFor="name" className="form-label">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="description" className="form-label">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                value={formData.description}
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

            {/* Add New Quote Form */}
            <div className="new-quote-form">
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
                <button
                  type="button"
                  onClick={handleAddQuote}
                  className="add-quote-button"
                >
                  Agregar Cuota
                </button>
              </div>
            </div>

            {/* Quotes List */}
            {formData.quotes.length > 0 && (
              <div className="quotes-list-container">
                <h4 className="quotes-list-title">Cuotas Agregadas</h4>
                <div className="quotes-list">
                  {formData.quotes.map((quote, index) => (
                    <div key={quote.id} className="quote-list-item">
                      <div>
                        <div className="quote-list-item-name">{quote.name}</div>
                        <div className="quote-list-item-details">
                          ${quote.price} - {quote.duration}{" "}
                          {quote.duration === 1 ? "mes" : "meses"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuote(index)}
                        className="quote-remove-button"
                      >
                        <X className="remove-icon" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="action-add-modal-button">
            <AppButton label='Cancelar' variant='secondary' type="button" onClick={onClose}>
              Cancelar
            </AppButton>
            <AppButton label='Guardar' type="submit">
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
};
