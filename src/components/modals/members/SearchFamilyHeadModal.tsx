import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { Member } from '../../../types';

interface SearchFamilyHeadModalProps {
  onClose: () => void;
  onSelect: (familyHead: Member) => void;
  familyHeads: Member[];
}

export const SearchFamilyHeadModal: React.FC<SearchFamilyHeadModalProps> = ({
  onClose,
  onSelect,
  familyHeads
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHeads = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return familyHeads.filter(head => 
      head.name.toLowerCase().includes(term) || 
      head.dni.toLowerCase().includes(term)
    );
  }, [familyHeads, searchTerm]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Buscar Jefe de Familia
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] sm:text-sm"
            placeholder="Buscar por nombre o DNI..."
          />
        </div>

        <div className="mt-4 max-h-60 overflow-y-auto">
          {filteredHeads.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No se encontraron resultados
            </p>
          ) : (
            <div className="space-y-2">
              {filteredHeads.map((head) => (
                <button
                  key={head.id}
                  onClick={() => onSelect(head)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{head.name} {head.second_name}</div>
                  <div className="text-sm text-gray-500">DNI: {head.dni}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};