import React from "react";
import { DollarSign, Calendar, Users as UsersIcon } from "lucide-react";
import type { Sport } from "../../../types";

interface SportQuotesCardProps {
  sport: Sport;
}

export const SportQuotesCard: React.FC<SportQuotesCardProps> = ({ sport }) => {
  const totalQuotes = sport.quotes?.length || 0;
  const averagePrice = sport.quotes?.length
  ? sport.quotes.reduce((sum, quote) => sum + Number(quote.price), 0) /
    sport.quotes.length
  : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit max-h-[600px] flex flex-col">
      <div className="flex items-center mb-4">
        <DollarSign className="h-6 w-6 text-[#FFD700] mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Cuotas Disponibles
        </h2>
      </div>

      {sport.quotes && sport.quotes.length > 0 ? (
        <div className="flex flex-col gap-4">
          {/* Summary Stats */}
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

          {/* Scrollable List with max height */}
          <div className="overflow-y-auto max-h-72 pr-2">
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
                      <p className="text-lg font-bold text-[#FFD700]">
                        ${quote.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
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
                </div>
              ))}
            </div>
          </div>

          {/* Show total count below scroll */}
          {totalQuotes > 3 && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Mostrando {totalQuotes} cuotas disponibles
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay cuotas configuradas</p>
        </div>
      )}
    </div>
  );
};
