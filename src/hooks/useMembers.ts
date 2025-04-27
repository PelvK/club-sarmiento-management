import { useState, useEffect, useCallback } from 'react';
import type { Member } from '../types';
import { membersApi } from '../lib/api/members';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
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
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMember = useCallback(async (id: string) => {
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

  const createMember = useCallback(async (member: Omit<Member, 'id'>) => {
    try {
      const created = await membersApi.create(member);
      setMembers(prev => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create member');
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    deleteMember,
    updateMember,
    createMember,
    refreshMembers: fetchMembers
  };
}