import React from "react";
import { BarChart3, Users, Target, TrendingUp } from "lucide-react";
import { Sport } from "../../../lib/types/sport";

interface SportStatsCardProps {
  sport: Sport;
  sportMemberCounts: { primary: number; secondary: number };
  totalMembers: number;
}

export const SportStatsCard: React.FC<SportStatsCardProps> = ({
  /* sport */
  sportMemberCounts,
  totalMembers,
}) => {
  const primaryPercentage = totalMembers > 0 
    ? Math.round((sportMemberCounts.primary / totalMembers) * 100) 
    : 0;

  const secondaryPercentage = totalMembers > 0 
    ? Math.round((sportMemberCounts.secondary / totalMembers) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="flex items-center mb-4">
        <BarChart3 className="h-6 w-6 text-[#FFD700] mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Estadísticas</h2>
      </div>

      <div className="space-y-4">
        {/* Total Members */}
        <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC000] rounded-lg p-4 text-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total de Socios</p>
              <p className="text-2xl font-bold">{totalMembers}</p>
            </div>
            <Users className="h-8 w-8 opacity-80" />
          </div>
        </div>

        {/* Primary vs Secondary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">{primaryPercentage}%</span>
            </div>
            <p className="text-sm text-blue-600 font-medium">Principal</p>
            <p className="text-xl font-bold text-blue-700">{sportMemberCounts.primary}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-xs font-medium text-green-600">{secondaryPercentage}%</span>
            </div>
            <p className="text-sm text-green-600 font-medium">Secundaria</p>
            <p className="text-xl font-bold text-green-700">{sportMemberCounts.secondary}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Distribución de Socios</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="flex h-3 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 transition-all duration-300"
                style={{ width: `${primaryPercentage}%` }}
              ></div>
              <div 
                className="bg-green-500 transition-all duration-300"
                style={{ width: `${secondaryPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Principal ({sportMemberCounts.primary})</span>
            <span>Secundaria ({sportMemberCounts.secondary})</span>
          </div>
        </div>
      </div>
    </div>
  );
};