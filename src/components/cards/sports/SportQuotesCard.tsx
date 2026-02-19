import React, { useState } from "react";
import { DollarSign, Calendar, Users as UsersIcon/* , Edit2, Trash2  */} from "lucide-react";
import { Quote } from "../../../lib/types/quote";
import { useCuotes } from "../../../hooks";
import { Sport } from "../../../lib/types/sport";
import { EditSingleQuoteModal } from "../../modals/sports/EditSIngleQuoteModal";
import { ConfirmationModal } from "../../modals/common/confirmationModal/component";

interface SportQuotesCardProps {
  sport: Sport;
}

export const SportQuotesCard: React.FC<SportQuotesCardProps> = ({ sport }) => {
  const { updateSocietaryQuote, deleteSocietaryQuote } = useCuotes();
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null);
  const totalQuotes = sport.quotes?.length || 0;
  const averagePrice = sport.quotes?.length
  ? sport.quotes.reduce((sum, quote) => sum + Number(quote.price), 0) /
    sport.quotes.length
  : 0;

  const handleEditQuote = async (quote: Quote) => {
    try {
      await updateSocietaryQuote(quote);
      setEditingQuote(null);
    } catch (error) {
      console.error("Error updating quote:", error);
      alert(error instanceof Error ? error.message : "Error al actualizar la cuota");
    }
  };

  const handleDeleteQuote = async () => {
    if (!deletingQuote) return;

    try {
      await deleteSocietaryQuote(deletingQuote.id);
      setDeletingQuote(null);
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert(error instanceof Error ? error.message : "Error al eliminar la cuota");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <DollarSign className="h-6 w-6 text-[#FFD700] mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Cuotas Disponibles
        </h2>
      </div>

      {sport.quotes && sport.quotes.length > 0 ? (
        <div className="flex flex-col gap-4 flex-1">
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Total de Cuotas</p>
              <p className="text-xl font-bold text-gray-900">{totalQuotes}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Precio Promedio</p>
              <p className="text-xl font-bold text-gray-900">
                ${averagePrice.toFixed(0)}
              </p>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="space-y-3">
              {sport.quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {quote.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {quote.description}
                      </p>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="text-lg font-bold text-[#5a5a5a]">
                        ${quote.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {quote.duration}{" "}
                          {quote.duration === 1 ? "mes" : "meses"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-3 w-3 mr-1" />
                        <span>{quote.participants || 0} socios</span>
                      </div>
                    </div>
                    {/* <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingQuote(quote)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar cuota"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingQuote(quote)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar cuota"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalQuotes > 3 && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Mostrando {totalQuotes} cuotas disponibles
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay cuotas configuradas</p>
        </div>
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
