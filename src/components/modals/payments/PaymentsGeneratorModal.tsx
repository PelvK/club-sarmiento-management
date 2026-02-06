import React, { useState, useMemo } from 'react';
import { X, Calendar, Users, DollarSign, AlertTriangle, Eye } from 'lucide-react';
import { Member } from '../../../lib/types/member';
import { Sport } from '../../../lib/types/sport';
import { GenerationConfig } from '../../../lib/types/quote';

interface PaymentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: GenerationConfig) => Promise<void>;
  members: Member[];
  sports: Sport[];
}

export const PaymentGeneratorModal: React.FC<PaymentGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  members,
  sports
}) => {
  const [config, setConfig] = useState<GenerationConfig>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    includeSocietary: true,
    selectedMembers: [],
    selectedSports: [],
    notes: '',
    customAmounts: {}
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [memberSelection, setMemberSelection] = useState<'all' | 'by-sport' | 'individual'>('all');

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  const filteredMembers = useMemo(() => {
    if (memberSelection === 'all') {
      return members;
    }
    if (memberSelection === 'by-sport' && config.selectedSports.length > 0) {
      return members.filter(member => 
        member.sports?.some(sport => config.selectedSports.includes(sport.id))
      );
    }
    if (memberSelection === 'individual') {
      return members.filter(member => config.selectedMembers.includes(member.id));
    }
    return [];
  }, [members, memberSelection, config.selectedSports, config.selectedMembers]);

  const previewData = useMemo(() => {
    let totalPayments = 0;
    let totalAmount = 0;
    let sportPayments = 0;
    let societaryPayments = 0;
    let sportAmount = 0;
    let societaryAmount = 0;

    filteredMembers.forEach(member => {
      // Societary payments
      if (config.includeSocietary && member.societary_cuote) {
        societaryPayments++;
        societaryAmount += Number(member.societary_cuote.price);
        totalPayments++;
        totalAmount += Number(member.societary_cuote.price);
      }

      // Sport payments
      member.sports?.forEach(sport => {
        if (config.selectedSports.length === 0 || config.selectedSports.includes(sport.id)) {
          const customAmount = config.customAmounts[`${member.id}-${sport.id}`];
          const amount = customAmount || sport.quotes?.[0]?.price || 0;
          
          sportPayments++;
          sportAmount += Number(amount);
          totalPayments++;
          totalAmount += Number(amount);
        }
      });
    });

    return {
      totalPayments,
      totalAmount,
      sportPayments,
      societaryPayments,
      sportAmount,
      societaryAmount,
      breakdown: filteredMembers.map(member => ({
        member,
        payments: [
          ...(config.includeSocietary && member.societary_cuote ? [{
            type: 'societary' as const,
            amount: member.societary_cuote.price,
            description: member.societary_cuote.description
          }] : []),
          ...(member.sports?.filter(sport => 
            config.selectedSports.length === 0 || config.selectedSports.includes(sport.id)
          ).map(sport => ({
            type: 'sport' as const,
            amount: config.customAmounts[`${member.id}-${sport.id}`] || sport.quotes?.[0]?.price || 0,
            description: `${sport.name} - ${sport.quotes?.[0]?.name || 'Sin cuota'}`
          })) || [])
        ]
      }))
    };
  }, [filteredMembers, config]);

  const handleMemberSelectionChange = (type: 'all' | 'by-sport' | 'individual') => {
    setMemberSelection(type);
    setConfig(prev => ({
      ...prev,
      selectedMembers: type === 'individual' ? prev.selectedMembers : [],
      selectedSports: type === 'by-sport' ? prev.selectedSports : []
    }));
  };

  const handleMemberToggle = (memberId: number) => {
    setConfig(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(memberId)
        ? prev.selectedMembers.filter(id => id !== memberId)
        : [...prev.selectedMembers, memberId]
    }));
  };

  const handleSportToggle = (sportId: number) => {
    setConfig(prev => ({
      ...prev,
      selectedSports: prev.selectedSports.includes(sportId)
        ? prev.selectedSports.filter(id => id !== sportId)
        : [...prev.selectedSports, sportId]
    }));
  };

  const handleCustomAmountChange = (memberId: number, sportId: number, amount: number) => {
    const key = `${memberId}-${sportId}`;
    setConfig(prev => {
      const newCustomAmounts = { ...prev.customAmounts };
      if (amount) {
        newCustomAmounts[key] = amount;
      } else {
        delete newCustomAmounts[key];
      }
      return {
        ...prev,
        customAmounts: newCustomAmounts
      };
    });
  };

  const handleGenerate = async () => {
    try {
      await onGenerate(config);
      onClose();
      // Reset form
      setConfig({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        includeSocietary: true,
        selectedMembers: [],
        selectedSports: [],
        notes: '',
        customAmounts: {}
      });
      setMemberSelection('all');
      setShowPreview(false);
    } catch (error) {
      console.error('Error generating payments:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Generador de Cuotas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!showPreview ? (
          <div className="space-y-6">
            {/* Period Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Mes
                </label>
                <select
                  value={config.month}
                  onChange={(e) => setConfig(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <select
                  value={config.year}
                  onChange={(e) => setConfig(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Member Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Users className="inline h-4 w-4 mr-1" />
                Selección de Socios
              </label>
              
              <div className="space-y-3">
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={memberSelection === 'all'}
                      onChange={() => handleMemberSelectionChange('all')}
                      className="form-radio text-[#FFD700] focus:ring-[#FFD700]"
                    />
                    <span className="ml-2">Todos los socios</span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={memberSelection === 'by-sport'}
                      onChange={() => handleMemberSelectionChange('by-sport')}
                      className="form-radio text-[#FFD700] focus:ring-[#FFD700]"
                    />
                    <span className="ml-2">Por disciplina</span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={memberSelection === 'individual'}
                      onChange={() => handleMemberSelectionChange('individual')}
                      className="form-radio text-[#FFD700] focus:ring-[#FFD700]"
                    />
                    <span className="ml-2">Selección individual</span>
                  </label>
                </div>

                {memberSelection === 'by-sport' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disciplinas
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {sports.map(sport => (
                        <label key={sport.id} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={config.selectedSports.includes(sport.id)}
                            onChange={() => handleSportToggle(sport.id)}
                            className="form-checkbox text-[#FFD700] focus:ring-[#FFD700]"
                          />
                          <span className="ml-2 text-sm">{sport.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {memberSelection === 'individual' && (
                  <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Socios
                    </label>
                    <div className="space-y-2">
                      {members.map(member => (
                        <label key={member.id} className="inline-flex items-center w-full">
                          <input
                            type="checkbox"
                            checked={config.selectedMembers.includes(member.id)}
                            onChange={() => handleMemberToggle(member.id)}
                            className="form-checkbox text-[#FFD700] focus:ring-[#FFD700]"
                          />
                          <span className="ml-2 text-sm">
                            {member.name} {member.second_name} - DNI: {member.dni}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Opciones de Configuración
              </label>
              
              <div className="space-y-3">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={config.includeSocietary}
                    onChange={(e) => setConfig(prev => ({ ...prev, includeSocietary: e.target.checked }))}
                    className="form-checkbox text-[#FFD700] focus:ring-[#FFD700]"
                  />
                  <span className="ml-2">Incluir cuotas societarias</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                id="notes"
                value={config.notes}
                onChange={(e) => setConfig(prev => ({ ...prev, notes: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                rows={3}
                placeholder="Notas adicionales para esta generación..."
              />
            </div>

            {/* Custom Amounts */}
            {filteredMembers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Montos Personalizados (opcional)
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {filteredMembers.map(member => (
                    <div key={member.id} className="mb-4 last:mb-0">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {member.name} {member.second_name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                        {member.sports?.filter(sport => 
                          config.selectedSports.length === 0 || config.selectedSports.includes(sport.id)
                        ).map(sport => (
                          <div key={sport.id} className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 min-w-0 flex-1">
                              {sport.name}:
                            </span>
                            <input
                              type="number"
                              placeholder={sport.quotes?.[0]?.price.toString() || '0'}
                              value={config.customAmounts[`${member.id}-${sport.id}`] || ''}
                              onChange={(e) => handleCustomAmountChange(member.id, sport.id, parseFloat(e.target.value))}
                              className="w-24 text-sm rounded border-gray-300 focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </button>
            </div>
          </div>
        ) : (
          /* Preview */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Vista Previa de Generación</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Volver a configuración
              </button>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Resumen</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Período</p>
                  <p className="font-medium">{months[config.month - 1]} {config.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total de Cuotas</p>
                  <p className="font-medium">{previewData.totalPayments}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto Total</p>
                  <p className="font-medium text-[#FFD700]">{formatCurrency(previewData.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Socios Afectados</p>
                  <p className="font-medium">{filteredMembers.length}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Cuotas Deportivas</p>
                  <p className="font-medium">{previewData.sportPayments} - {formatCurrency(previewData.sportAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cuotas Societarias</p>
                  <p className="font-medium">{previewData.societaryPayments} - {formatCurrency(previewData.societaryAmount)}</p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  Esta acción generará {previewData.totalPayments} nuevas cuotas por un total de {formatCurrency(previewData.totalAmount)}. 
                  Esta operación no se puede deshacer automáticamente.
                </p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Socio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cuotas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.breakdown.map(({ member, payments }) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name} {member.second_name}
                        </div>
                        <div className="text-sm text-gray-500">DNI: {member.dni}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {payments.map((payment, index) => (
                            <div key={index} className="text-sm">
                              <span className="text-gray-900">{payment.description}</span>
                              <span className="text-gray-500 ml-2">- {formatCurrency(payment.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payments.reduce((sum, p) => sum + Number(p.amount), 0))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Modificar
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000]"
              >
                Generar Cuotas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};