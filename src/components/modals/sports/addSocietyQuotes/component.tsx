import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { QuoteFormData, SocietaryQuoteFormData } from "../types";
import "./styles.css";
import { useCuotes } from "../../../../hooks";

interface AddSocietaryQuoteModalProps {
  onClose: () => void;
  onSave: (quote: SocietaryQuoteFormData) => Promise<void>;
}

export const AddSocietaryQuoteModal: React.FC<AddSocietaryQuoteModalProps> = ({
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<SocietaryQuoteFormData>({
    quotes: [],
  });

  const [newQuote, setNewQuote] = useState<QuoteFormData>({
    name: "",
    price: 0,
    description: "",
    duration: 1,
  });

  const { societaryCuotes } = useCuotes();

  useEffect(() => {
    console.log("Existing societary cuotes:", societaryCuotes);
  }, [societaryCuotes]);

  const handleAddQuote = () => {
    if (!newQuote.name) {
      alert("El nombre de la cuota es obligatorio");
      return;
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
          <h2 className="add-sport-modal-title">Cuotas societarias</h2>
          <button onClick={onClose} className="add-sport-modal-close">
            <X className="close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-sport-modal-form">
          <div className="quotes-section">
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
                <h4 className="quotes-list-title">Cuotas por agregar</h4>
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

            {/* Quotes added */}
            {societaryCuotes.length > 0 && (
              <div className="quotes-list-container">
                <h4 className="quotes-list-title">Cuotas actuales</h4>
                <div className="quotes-list">
                  {societaryCuotes.map((quote) => (
                    <div key={quote.id} className="quote-list-item">
                      <div>
                        <div className="quote-list-item-name">{quote.name}</div>
                        <div className="quote-list-item-details">
                          ${quote.price} - {quote.duration}{" "}
                          {quote.duration === 1 ? "mes" : "meses"}
                        </div>
                      </div>
                      {/* <button
                        type="button"
                        onClick={() => handleRemoveQuote(index)}
                        className="quote-remove-button"
                      >
                        <X className="remove-icon" />
                      </button> */}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
