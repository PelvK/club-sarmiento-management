import { useState, useEffect, useCallback } from 'react';
import { membersApi } from '../lib/api/members';
import { Member } from '../lib/types/member';
import { MemberFormData } from '../components/modals/members/types';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [familyHeads, setFamilyHeads] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await membersApi.getAll();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
      console.log(err)
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFamiliyHeads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await membersApi.getAllFamilyHeads();
      setFamilyHeads(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
      console.log(err)
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMember = useCallback(async (id: number) => {
    try {
      await membersApi.delete(id);
      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
    }
  }, []);

  const updateMember = useCallback(async (member: Member) => {
    try {
      const updated = await membersApi.update(member);
      setMembers(prev => prev.map(m => m.id === member.id ? updated : m));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
    }
  }, []);

  const createMember = useCallback(async (member: MemberFormData) => {
    
    try {
      const created = await membersApi.create(member);
      setMembers(prev => [...prev, created]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create member');
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchFamiliyHeads();
  }, [fetchMembers, fetchFamiliyHeads]);

  return {
    members,
    familyHeads,
    loading,
    error,
    deleteMember,
    updateMember,
    createMember,
    refreshMembers: fetchMembers
  };
}