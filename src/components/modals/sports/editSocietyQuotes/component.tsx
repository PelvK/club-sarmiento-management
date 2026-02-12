import React, { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { QuoteFormData, SocietaryQuoteFormData } from "../types";
import "./styles.css";
import { useCuotes } from "../../../../hooks";

interface EditSocietaryQuoteModalProps {
  onClose: () => void;
  onSave: (quotes: QuoteFormData[]) => Promise<void>;
  onDelete: (quoteId: number) => Promise<void>;
}

export const EditSocietaryQuoteModal: React.FC<
  EditSocietaryQuoteModalProps
> = ({ onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<SocietaryQuoteFormData>({
    quotes: [],
  });

  const [newQuote, setNewQuote] = useState<QuoteFormData>({
    name: "",
    price: 0,
    description: "",
    duration: 1,
  });

  /**
   * @todo NWD-010
   */
  const [editingQuotes, setEditingQuotes] = useState<
    Map<number, QuoteFormData>
  >(new Map());
  const { societaryCuotes /* loading */ } = useCuotes();

  useEffect(() => {
    // Inicializar el mapa de edición con las cuotas existentes
    const editMap = new Map<number, QuoteFormData>();
    societaryCuotes.forEach((quote) => {
      editMap.set(quote.id!, { ...quote });
    });
    setEditingQuotes(editMap);
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

  const handleRemoveNewQuote = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      quotes: prev.quotes.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteExistingQuote = async (quoteId: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta cuota?")) {
      await onDelete(quoteId);
      const newEditingQuotes = new Map(editingQuotes);
      newEditingQuotes.delete(quoteId);
      setEditingQuotes(newEditingQuotes);
    }
  };

  const handleEditExistingQuote = (
    quoteId: number,
    field: keyof QuoteFormData,
    value: string | number,
  ) => {
    const newEditingQuotes = new Map(editingQuotes);
    const quote = newEditingQuotes.get(quoteId);
    if (quote) {
      newEditingQuotes.set(quoteId, {
        ...quote,
        [field]: value,
      });
      setEditingQuotes(newEditingQuotes);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar cuotas editadas
    /**
     * @todo NWD-010
     */
    for (const [, /* id */ quote] of editingQuotes) {
      if (!quote.name) {
        alert("Todas las cuotas deben tener un nombre");
        return;
      }
      if (quote.price < 0) {
        alert("El precio no puede ser negativo");
        return;
      }
    }

    // Combinar cuotas editadas y nuevas
    const allQuotes = [
      ...Array.from(editingQuotes.values()),
      ...formData.quotes,
    ];

    if (allQuotes.length === 0) {
      alert("Debe tener al menos una cuota");
      return;
    }

    await onSave(allQuotes);
    onClose();
  };

  return (
    <div className="add-sport-modal-overlay">
      <div className="add-sport-modal-content">
        <div className="add-sport-modal-header">
          <h2 className="add-sport-modal-title">Editar Cuotas Societarias</h2>
          <button onClick={onClose} className="add-sport-modal-close">
            <X className="close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-sport-modal-form">
          <div className="quotes-section">
            {/* Cuotas Existentes - Editables */}
            {Array.from(editingQuotes.values()).length > 0 && (
              <div className="quotes-list-container">
                <h4 className="quotes-list-title">Cuotas actuales</h4>
                <div className="space-y-4">
                  {Array.from(editingQuotes.entries()).map(([id, quote]) => (
                    <div key={id} className="border rounded-lg p-4 bg-white">
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="form-field">
                          <label className="form-label text-xs">Nombre</label>
                          <input
                            type="text"
                            value={quote.name}
                            onChange={(e) =>
                              handleEditExistingQuote(
                                id,
                                "name",
                                e.target.value,
                              )
                            }
                            className="form-input"
                          />
                        </div>

                        <div className="form-field">
                          <label className="form-label text-xs">Precio</label>
                          <input
                            type="number"
                            value={quote.price}
                            onChange={(e) =>
                              handleEditExistingQuote(
                                id,
                                "price",
                                parseFloat(e.target.value),
                              )
                            }
                            className="form-input"
                            min="0"
                            step="50.00"
                          />
                        </div>

                        <div className="form-field">
                          <label className="form-label text-xs">
                            Duración (meses)
                          </label>
                          <input
                            type="number"
                            value={quote.duration}
                            onChange={(e) =>
                              handleEditExistingQuote(
                                id,
                                "duration",
                                parseInt(e.target.value),
                              )
                            }
                            className="form-input"
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="form-field mb-3">
                        <label className="form-label text-xs">
                          Descripción (opcional)
                        </label>
                        <input
                          type="text"
                          value={quote.description || ""}
                          onChange={(e) =>
                            handleEditExistingQuote(
                              id,
                              "description",
                              e.target.value,
                            )
                          }
                          className="form-input"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingQuote(id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agregar Nueva Cuota */}
            <div className="new-quote-form mt-6">
              <h4 className="quotes-list-title mb-4">Agregar nueva cuota</h4>
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

            {/* Cuotas Nuevas Pendientes de Guardar */}
            {formData.quotes.length > 0 && (
              <div className="quotes-list-container mt-6">
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
                        onClick={() => handleRemoveNewQuote(index)}
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

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
