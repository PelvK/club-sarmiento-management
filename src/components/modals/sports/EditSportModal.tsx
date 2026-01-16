import React, { useState, useEffect } from "react";
import { X, DollarSign, Check, Pencil } from "lucide-react";
import { Sport } from "../../../lib/types/sport";
import { Quote } from "../../../lib/types/quote";

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
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [newQuote, setNewQuote] = useState<Quote>({
    name: "",
    price: 0,
    description: "",
    duration: 1,
  });

  useEffect(() => {
    if (sport) {
      setFormData({
        id: sport.id,
        name: sport.name,
        description: sport.description,
      });
      setQuotes(sport.quotes || []);
    }
  }, [sport]);

  const handleAddQuote = () => {
    if (!newQuote.name || newQuote.price < 0) {
      alert("Por favor complete los campos requeridos de la cuota");
      return;
    }

    setQuotes((prev) => [...prev, newQuote]);

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

  const handleEditQuote = (quote: Quote) => {
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

    onClose();
  };

  if (!sport) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Editar Disciplina</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Quotes Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-[#FFD700] mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Cuotas</h3>
            </div>

            {/* Existing Quotes List */}
            {quotes.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Cuotas Actuales</h4>
                <div className="space-y-2">
                  {quotes.map((quote, index) => (
                    <div key={quote.id} className="bg-white p-3 rounded-md border">
                      {editingQuoteId === quote.id ? (
                        // Edit mode
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Nombre
                              </label>
                              <input
                                type="text"
                                value={editingQuote?.name || ''}
                                onChange={(e) => setEditingQuote(prev => 
                                  prev ? { ...prev, name: e.target.value } : null
                                )}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Precio
                              </label>
                              <input
                                type="number"
                                value={editingQuote?.price || 0}
                                onChange={(e) => setEditingQuote(prev => 
                                  prev ? { ...prev, price: parseFloat(e.target.value) } : null
                                )}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Duración (meses)
                              </label>
                              <input
                                type="number"
                                value={editingQuote?.duration || 1}
                                onChange={(e) => setEditingQuote(prev => 
                                  prev ? { ...prev, duration: parseInt(e.target.value) } : null
                                )}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Descripción
                              </label>
                              <input
                                type="text"
                                value={editingQuote?.description || ''}
                                onChange={(e) => setEditingQuote(prev => 
                                  prev ? { ...prev, description: e.target.value } : null
                                )}
                                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={handleCancelQuoteEdit}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveQuoteEdit}
                              className="px-3 py-1 text-sm bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000] flex items-center"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{quote.name}</div>
                            <div className="text-sm text-gray-500">
                              {quote.description}
                            </div>
                            <div className="text-sm text-gray-500">
                              ${quote.price} - {quote.duration} {quote.duration === 1 ? 'mes' : 'meses'}
                            </div>
                            <div className="text-sm text-gray-500">
                              miembros asociados: {quote.participants || 0}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditQuote(quote)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Editar cuota"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuote(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Eliminar cuota"
                            >
                              <X className="h-4 w-4" />
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
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Agregar Nueva Cuota</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quoteName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Cuota
                  </label>
                  <input
                    type="text"
                    id="quoteName"
                    value={newQuote.name}
                    onChange={(e) => setNewQuote(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="quotePrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    id="quotePrice"
                    value={newQuote.price}
                    onChange={(e) => setNewQuote(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label htmlFor="quoteDuration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (meses)
                  </label>
                  <input
                    type="number"
                    id="quoteDuration"
                    value={newQuote.duration}
                    onChange={(e) => setNewQuote(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                    min="1"
                  />
                </div>

                <div>
                  <label htmlFor="quoteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    id="quoteDescription"
                    value={newQuote.description}
                    onChange={(e) => setNewQuote(prev => ({ ...prev, description: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddQuote}
                  className="px-4 py-2 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
                >
                  Agregar Cuota
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                setFormData({});
                setQuotes([]);
                setEditingQuoteId(null);
                setEditingQuote(null);
                setNewQuote({
                  name: '',
                  price: 0,
                  description: '',
                  duration: 1
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};