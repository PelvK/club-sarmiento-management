import React, { useState, useEffect } from 'react';
import { Trophy, Users, Search } from 'lucide-react';
import { Member, Sport } from '../../types';
import { SearchFamilyHeadModal } from './SearchFamilyHeadModal';

interface EditMemberModalProps {
  member: Member | null;
  onClose: () => void;
  onSave: (member: Member) => Promise<void>;
}

interface SportSelection {
  name: string;
  isPrimary: boolean;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Member>();

  const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
  const [showFamilyHeadSearch, setShowFamilyHeadSearch] = useState(false);
  const [selectedFamilyHead, setSelectedFamilyHead] = useState<Member | null>(null);

  useEffect(() => {
    if (member) {
      setFormData(member);
     
      const primarySport = member.sports?.filter(sport => sport.isPrincipal);
      const secondarySports = member.sports?.filter(sport => !sport.isPrincipal) || [];

      setSelectedSports([
        primarySport![0],
        ...secondarySports
      ]);

      // Set selected family head if member belongs to a family
      if (member.familyHeadId) {
        const familyHead = familyHeads.find(h => h.id === member.familyHeadId);
        if (familyHead) {
          setSelectedFamilyHead(familyHead);
        }
      }
    }
  }, [member, familyHeads]);

  const handleSportChange = (sportName: string, checked: boolean) => {
    if (checked) {
      setSelectedSports(prev => [...prev, {
        id: 
        name: sportName,
        isPrincipal: prev.length === 0
      }]);
    } else {
      setSelectedSports(prev => {
        const filtered = prev.filter(s => s.name !== sportName);
        if (filtered.length > 0 && !filtered.some(s => s.isPrincipal)) {
          filtered[0].isPrincipal = true;
        }
        return filtered;
      });
    }
  };

  const setPrimarySport = (sportName: string) => {
    setSelectedSports(prev => prev.map(sport => ({
      ...sport,
      isPrimary: sport.name === sportName
    })));
  };

  const handleFamilyHeadSelect = (head: Member) => {
    setSelectedFamilyHead(head);
    setFormData(prev => ({ ...prev, familyHeadId: head.id }));
    setShowFamilyHeadSearch(false);
  };

  useEffect(() => {
    if (formData.familyHeadId && !formData.isFamilyHead && selectedFamilyHead) {
      const headSport = selectedFamilyHead.sport;
      if (selectedSports.some(s => s.name === headSport)) {
        setPrimarySport(headSport);
      }
    }
  }, [formData.familyHeadId, formData.isFamilyHead, selectedFamilyHead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (selectedSports.length === 0) {
      alert('Por favor, seleccione al menos una disciplina');
      return;
    }

    const primarySport = selectedSports.find(s => s.isPrimary);
    if (!primarySport) {
      alert('Por favor, seleccione una disciplina principal');
      return;
    }

    await onSave({
      ...formData,
      sport: primarySport.name,
      secondarySports: selectedSports
        .filter(s => !s.isPrimary)
        .map(s => s.name)
    });
    onClose();
  };

  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Socio</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                DNI
              </label>
              <input
                type="text"
                id="dni"
                value={formData.dni}
                onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Ingreso
              </label>
              <input
                type="date"
                id="joinDate"
                value={formData.joinDate}
                onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                required
              />
            </div>
          </div>

          {/* Family Group Section */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-[#FFD700] mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Grupo Familiar</h3>
            </div>

            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.isFamilyHead}
                  onChange={() => {
                    setFormData(prev => ({ ...prev, isFamilyHead: true, familyHeadId: '' }));
                    setSelectedFamilyHead(null);
                  }}
                  className="form-radio text-[#FFD700] focus:ring-[#FFD700]"
                  name="familyRole"
                />
                <span className="ml-2">Jefe de Familia</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={!formData.isFamilyHead}
                  onChange={() => setFormData(prev => ({ ...prev, isFamilyHead: false }))}
                  className="form-radio text-[#FFD700] focus:ring-[#FFD700]"
                  name="familyRole"
                />
                <span className="ml-2">Miembro de Familia</span>
              </label>
            </div>

            {!formData.isFamilyHead && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jefe de Familia
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-2 border rounded-md bg-gray-50">
                    {selectedFamilyHead ? (
                      <div>
                        <div className="font-medium">{selectedFamilyHead.name}</div>
                        <div className="text-sm text-gray-500">DNI: {selectedFamilyHead.dni}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Ningún jefe de familia seleccionado</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFamilyHeadSearch(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sports Selection */}
          <div>
            <div className="flex items-center mb-4">
              <Trophy className="h-5 w-5 text-[#FFD700] mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Disciplinas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sports.map((sport) => {
                const isSelected = selectedSports.some(s => s.name === sport);
                const isPrimary = selectedSports.some(s => s.name === sport && s.isPrincipal);

                return (
                  <div key={sport} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`sport-${sport}`}
                        checked={isSelected}
                        onChange={(e) => handleSportChange(sport, e.target.checked)}
                        className="h-4 w-4 text-[#FFD700] focus:ring-[#FFD700] border-gray-300 rounded"
                      />
                      <label htmlFor={`sport-${sport}`} className="ml-2 text-sm text-gray-900">
                        {sport}
                      </label>
                    </div>
                    
                    {isSelected && (
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`primary-${sport}`}
                          name="primary-sport"
                          checked={isPrimary}
                          onChange={() => setPrimarySport(sport)}
                          className="h-4 w-4 text-[#FFD700] focus:ring-[#FFD700] border-gray-300"
                        />
                        <label htmlFor={`primary-${sport}`} className="ml-2 text-sm text-gray-600">
                          Principal
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      {showFamilyHeadSearch && (
        <SearchFamilyHeadModal
          onClose={() => setShowFamilyHeadSearch(false)}
          onSelect={handleFamilyHeadSelect}
          familyHeads={familyHeads}
        />
      )}
    </div>
  );
};