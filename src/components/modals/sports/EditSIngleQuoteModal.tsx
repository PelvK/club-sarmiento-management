import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Quote } from "../../../lib/types/quote";
import { AppButton } from "../../common/AppButton/component";

interface EditSingleQuoteModalProps {
  quote: Quote;
  onClose: () => void;
  onSave: (quote: Quote) => Promise<void>;
}

export const EditSingleQuoteModal: React.FC<EditSingleQuoteModalProps> = ({
  quote,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Quote>({
    id: quote.id,
    name: quote.name,
    price: quote.price,
    description: quote.description,
    duration: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      id: quote.id,
      name: quote.name,
      price: quote.price,
      description: quote.description,
      duration: 1,
    });
  }, [quote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (formData.price < 0) {
      setError("El precio no puede ser negativo");
      return;
    }

    if (formData.duration < 1) {
      setError("La duración debe ser al menos 1 mes");
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la cuota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-sport-modal-overlay">
      <div className="add-sport-modal-content">
        <div className="add-sport-modal-header">
          <h2 className="add-sport-modal-title">Editar Cuota Societaria</h2>
          <button onClick={onClose} className="add-sport-modal-close">
            <X className="close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-sport-modal-form">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="quoteName" className="form-label">
              Nombre de la Cuota <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="quoteName"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="form-input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <label htmlFor="quotePrice" className="form-label">
                Precio <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quotePrice"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="form-input"
                min="0"
                step="50"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="quoteDuration" className="form-label">
                Duración (meses) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quoteDuration"
                value={1}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 1,
                  }))
                }
                className="form-input"
                min="1"
                required
                disabled
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="quoteDescription" className="form-label">
              Descripción
            </label>
            <textarea
              id="quoteDescription"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="form-input"
              rows={3}
            />
          </div>

          <div className="action-add-modal-button">
            <AppButton
              label="Cancelar"
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={loading}
            />
            <AppButton
              label={loading ? "Guardando..." : "Guardar Cambios"}
              type="submit"
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
