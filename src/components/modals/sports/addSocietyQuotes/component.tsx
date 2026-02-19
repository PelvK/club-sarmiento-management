import React, { useState } from "react";
import { X, Edit2, Trash2 } from "lucide-react";
import { QuoteFormData, SocietaryQuoteFormData } from "../types";
import "./styles.css";
import { useCuotes } from "../../../../hooks";
import { AppButton } from "../../../common/AppButton/component";
import { useErrorHandler } from "../../../../hooks/useErrorHandler";
import { ErrorModal } from "../../common/ErrorModal";
import { Quote } from "../../../../lib/types/quote";
import { ConfirmationModal } from "../../common/confirmationModal/component";
import { EditSingleQuoteModal } from "../EditSIngleQuoteModal";

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

  const { societaryCuotes, updateSocietaryQuote, deleteSocietaryQuote, refreshSocietaryCuotes } =
    useCuotes();
  const { error, isErrorModalOpen, handleError, closeErrorModal } =
    useErrorHandler();
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null);

  const handleAddQuote = () => {
    if (!newQuote.name) {
      handleError({
        success: false,
        message: "El nombre de la cuota es obligatorio",
      });
      return;
    }

    if (newQuote.price < 0) {
      handleError({
        success: false,
        message: "El precio no puede ser negativo",
      });
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

  const handleEditQuote = async (quote: Quote) => {
    try {
      await updateSocietaryQuote(quote);
      await refreshSocietaryCuotes(); // 👈 forzás un re-fetch
      setEditingQuote(null);
    } catch (err) {
      handleError({
        success: false,
        message:
          err instanceof Error ? err.message : "Error al actualizar la cuota",
      });
    }
  };

  const handleDeleteQuote = async () => {
    if (!deletingQuote) return;
    try {
      await deleteSocietaryQuote(deletingQuote.id);
      await refreshSocietaryCuotes(); // 👈 ídem acá
      setDeletingQuote(null);
    } catch (err) {
      handleError({
        success: false,
        message:
          err instanceof Error ? err.message : "Error al eliminar la cuota",
      });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.quotes.length === 0) {
      handleError({
        success: false,
        message: "Debe agregar al menos una cuota",
      });

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
                    disabled
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
                ></AppButton>
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
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingQuote(quote)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar cuota"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingQuote(quote)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar cuota"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="action-add-modal-button">
            <AppButton
              label="Cancelar"
              variant="secondary"
              type="button"
              onClick={onClose}
            ></AppButton>
            <AppButton label="Guardar Cambios" type="submit"></AppButton>
          </div>
        </form>
      </div>
      {error && (
        <ErrorModal
          isOpen={isErrorModalOpen}
          onClose={closeErrorModal}
          error={error}
          showDetails={process.env.NODE_ENV === "development"}
        />
      )}

      {editingQuote && (
        <EditSingleQuoteModal
          quote={editingQuote}
          onClose={() => setEditingQuote(null)}
          onSave={handleEditQuote}
        />
      )}

      {deletingQuote && (
        <ConfirmationModal
          isOpen={true}
          title="Eliminar Cuota"
          message={`¿Está seguro de que desea eliminar la cuota "${deletingQuote.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteQuote}
          onClose={() => setDeletingQuote(null)}
          type="danger"
        />
      )}
    </div>
  );
};
