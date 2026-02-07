import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../lib/api/users';
import { User, CreateUserRequest, UpdateUserRequest } from '../lib/types/auth';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await usersApi.delete(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (id: string, userData: UpdateUserRequest) => {
    try {
      const updated = await usersApi.update(id, userData);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserRequest) => {
    try {
      const created = await usersApi.create(userData);
      setUsers(prev => [...prev, created]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    }
  }, []);

  const toggleUserActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      const updated = await usersApi.toggleActive(id, isActive);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle user status');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    deleteUser,
    updateUser,
    createUser,
    toggleUserActive,
    refreshUsers: fetchUsers,
  };
}
