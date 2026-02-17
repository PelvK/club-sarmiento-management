import React from "react";
import { Calendar, DollarSign, Users } from "lucide-react";
import { MONTHS } from "./PeriodSelector";
import { PreviewData } from "../../../lib/types/payment";

interface PreviewSummaryProps {
  previewData: PreviewData;
  month: number;
  year: number;
  filteredMembersCount: number;
  formatCurrency: (amount: number) => string;
}

export const PreviewSummary: React.FC<PreviewSummaryProps> = ({
  previewData,
  month,
  year,
  filteredMembersCount,
  formatCurrency,
}) => {
  return (
    <section>
      <h4 className="text-lg font-semibold mb-4">Resumen General</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-blue-600">Período</p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {MONTHS[month - 1]} {year}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-green-600">
              Total de Cuotas
            </p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {previewData.totalPayments}
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-yellow-600" />
            <p className="text-xs font-medium text-yellow-600">Monto Total</p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(previewData.totalAmount)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-medium text-purple-600">
              Socios Afectados
            </p>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {filteredMembersCount}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Cuotas Societarias
          </p>
          <p className="text-xl font-bold text-gray-900">
            {previewData.onlySocietaryCount}
          </p>
          <p className="text-sm text-gray-500">
            {formatCurrency(previewData.onlySocietaryAmount)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Socios sin disciplinas</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-100 border-2">
          <p className="text-sm font-medium text-green-600 mb-1">
            Disciplinas Principales
          </p>
          <p className="text-xl font-bold text-gray-900">
            {previewData.principalSportsCount}
          </p>
          <p className="text-sm text-gray-500">
            {formatCurrency(previewData.principalSportsAmount)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Incluye cuota societaria
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Disciplinas Secundarias
          </p>
          <p className="text-xl font-bold text-gray-900">
            {previewData.secondarySportsCount}
          </p>
          <p className="text-sm text-gray-500">
            {formatCurrency(previewData.secondarySportsAmount)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Solo cuota deportiva</p>
        </div>
      </div>
    </section>
  );
};