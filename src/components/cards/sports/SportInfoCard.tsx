import React from "react";
import { Trophy, FileText } from "lucide-react";
import type { Sport } from "../../../types";

interface SportInfoCardProps {
  sport: Sport;
}

export const SportInfoCard: React.FC<SportInfoCardProps> = ({ sport }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
      <div className="flex items-center mb-4">
        <Trophy className="h-6 w-6 text-[#FFD700] mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Información General</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500 font-medium">Nombre de la Disciplina</label>
          <p className="text-lg font-semibold text-gray-900 mt-1">{sport.name}</p>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <FileText className="h-4 w-4 text-gray-400 mr-1" />
            <label className="text-sm text-gray-500 font-medium">Descripción</label>
          </div>
          <p className="text-gray-700 leading-relaxed">{sport.description}</p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Estado</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Activa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};