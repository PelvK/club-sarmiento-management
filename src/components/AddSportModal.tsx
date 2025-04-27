import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import type { Sport, Quote } from '../types';

interface AddSportModalProps {
  onClose: () => void;
  onSave: (sport: Omit<Sport, 'id'>) => Promise<void>;
}

export const AddSportModal: React.FC<AddSportModalProps> = ({
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quotes: [] as Quote[]
  });

  const [newQuote, setNewQuote] = useState({
    name: '',
    price: 0,
    description: '',
    duration: 1
  });

  const handleAddQuote = () => {
    if (!newQuote.name || newQuote.price <= 0) {
      alert('Por favor complete los campos requeridos de la cuota');
      return;
    }

    setFormData(prev => ({
      ...prev,
      quotes: [...prev.quotes, { ...newQuote, id: crypto.randomUUID() }]
    }));

    setNewQuote({
      name: '',
      price: 0,
      description: '',
      duration: 1
    });
  };

  const handleRemoveQuote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quotes: prev.quotes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.quotes.length === 0) {
      alert('Debe agregar al menos una cuota');
      return;
    }

    await onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nueva Disciplina</h2>
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
                value={formData.name}
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
                value={formData.description}
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

            {/* Add New Quote Form */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
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

            {/* Quotes List */}
            {formData.quotes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Cuotas Agregadas</h4>
                <div className="space-y-2">
                  {formData.quotes.map((quote, index) => (
                    <div key={quote.id} className="flex items-center justify-between bg-white p-3 rounded-md border">
                      <div>
                        <div className="font-medium">{quote.name}</div>
                        <div className="text-sm text-gray-500">
                          ${quote.price} - {quote.duration} {quote.duration === 1 ? 'mes' : 'meses'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuote(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};