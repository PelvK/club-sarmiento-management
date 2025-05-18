import React, { useState, useMemo } from 'react';
import { PlusCircle, Pencil, Trash2, Plus, MessageCircleWarning } from 'lucide-react';
import { useMembers } from '../hooks/useMembers';
import { usePayments } from '../hooks/usePayments';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { MemberFilters } from '../components/MemberFilters';
import { EditMemberModal } from '../components/EditMemberModal';
import { MemberDetailsModal } from '../components/MemberDetailsModal';
import { AddMemberModal } from '../components/AddMemberModal';
import type { Member } from '../types';

const Members: React.FC = () => {
  const { members, loading, error, deleteMember, updateMember, createMember } = useMembers();
  const { payments } = usePayments();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberForDetails, setMemberForDetails] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    dni: '',
    sport: ''
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (member: Member) => {
    setSelectedMember(member);
  };

  const handleDetailsClick = (member: Member) => {
    setMemberForDetails(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  const handleCloseDetails = () => {
    setMemberForDetails(null);
  };

  const handleSaveMember = async (member: Member) => {
    await updateMember(member);
    setSelectedMember(null);
  };

  const handleCreateMember = async (member: Omit<Member, 'id'>) => {
    await createMember(member);
    setShowAddModal(false);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const nameMatch = member.name.toLowerCase().includes(filters.name.toLowerCase());
      const dniMatch = member.dni.toLowerCase().includes(filters.dni.toLowerCase());
      const sportMatch = !filters.sport || member.sport === filters.sport;
      return nameMatch && dniMatch && sportMatch;
    });
  }, [members, filters]);

  const sportsList = useMemo(() => {
    return [...new Set(members.map(member => member.sport))];
  }, [members]);

  const familyHeads = useMemo(() => {
    return members.filter(member => member.isFamilyHead);
  }, [members]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Socios</h1>
        <div className='flex flex-row'>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center mx-4 px-4 py-2 bg-[#FFD700] text-black rounded-md hover:bg-[#FFC000] transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Agregar Socio
          </button>
          <button className="flex items-center px-4 py-2 text-black rounded-md hover:bg-[#FFC000] transition-colors">
            <MessageCircleWarning className="w-5 h-5 mr-2" />
            Socios sin configurar
          </button>
        </div>
      </div>

      <MemberFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        sports={sportsList}
      />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#1a1a1a]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">DNI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Sport</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Join Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Family Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.dni}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.sport}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.isFamilyHead ? 'Jefe de Familia' : 'Miembro'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditClick(member)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteMember(member.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDetailsClick(member)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <EditMemberModal
          member={selectedMember}
          onClose={handleCloseModal}
          onSave={handleSaveMember}
          sports={sportsList}
          familyHeads={familyHeads}
        />
      )}

      {memberForDetails && (
        <MemberDetailsModal
          member={memberForDetails}
          onClose={handleCloseDetails}
          payments={payments.filter(p => p.memberId === memberForDetails.id)}
          familyMembers={members.filter(m => m.familyHeadId === memberForDetails.id)}
        />
      )}

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateMember}
          sports={sportsList}
          familyHeads={familyHeads}
        />
      )}
    </div>
  );
};

export default Members;