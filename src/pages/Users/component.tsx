import React, { useState, useMemo } from "react";
import { PlusCircle, Shield, UserCheck, UsersIcon, UserX } from "lucide-react";
import { useUsers, useSports } from "../../hooks";
import { ErrorMessage } from "../../components/ErrorMessage";
import {
  UsersFilter,
  UsersFiltersType,
} from "../../components/filters/UserFilter";
import { UserList } from "../../components/lists/user";
import { AppButton } from "../../components/common/AppButton/component";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../../lib/types/auth";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { AddUserModal } from "../../components/modals/users/addUser";
import { EditUserModal, UserDetailsModal } from "../../components/modals/users";
import "./styles.css";
import { SHOW_STATS } from "../../lib/utils/consts";

const filterInitialState: UsersFiltersType = {
  username: "",
  email: "",
  role: "all",
  status: "all",
  sport: "all",
};

const Users: React.FC = () => {
  const {
    users,
    loading,
    error,
    deleteUser,
    updateUser,
    createUser,
    toggleUserActive,
    refreshUsers,
  } = useUsers();
  const { sportSimple } = useSports();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForDetails, setUserForDetails] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState<UsersFiltersType>(filterInitialState);

  const handleFilterChange = (name: keyof UsersFiltersType, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDetailsClick = (user: User) => {
    setUserForDetails(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowEditModal(false);
  };

  const handleCloseDetails = () => {
    setUserForDetails(null);
    handleCloseModal();
  };

  const handleSaveUser = async (id: string, userData: UpdateUserRequest) => {
    await updateUser(id, userData);
    await refreshUsers();
    setSelectedUser(null);
  };

  const handleCreateUser = async (userData: CreateUserRequest) => {
    await createUser(userData);
    await refreshUsers();
    setShowAddModal(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("¿Está seguro que desea eliminar este usuario?")) {
      try {
        await deleteUser(id);
        await refreshUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleUserActive(id, isActive);
      await refreshUsers();
    } catch (err) {
      console.error("Error toggling user status:", err);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      const usernameMatch =
        !filters.username ||
        user.username.toLowerCase().includes(filters.username.toLowerCase());

      const emailMatch =
        !filters.email ||
        user.email.toLowerCase().includes(filters.email.toLowerCase());

      const roleMatch =
        filters.role === "all" ||
        (filters.role === "admin" && user.is_admin) ||
        (filters.role === "user" && !user.is_admin);

      const statusMatch =
        filters.status === "all" ||
        (filters.status === "active" && user.is_active) ||
        (filters.status === "inactive" && !user.is_active);

      const sportMatch =
        filters.sport === "all" ||
        (user.sport_supported &&
          user.sport_supported.some((s) => s.name === filters.sport));

      return (
        usernameMatch && emailMatch && roleMatch && statusMatch && sportMatch
      );
    });
  }, [users, filters]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="users-header">
        <div className="users-header-content">
          <div className="users-title-section">
            <h1 className="users-title">Usuarios del Sistema</h1>
            <p className="users-subtitle">
              Gestiona los usuarios y permisos del sistema
            </p>
          </div>
          <div className="users-actions">
            <AppButton
              onClick={() => setShowAddModal(true)}
              label="Agregar Usuario"
              startIcon={<PlusCircle className="w-5 h-5 mr-2" />}
            />
          </div>
        </div>
        {SHOW_STATS && (
          <div className="users-stats">
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">
                <UsersIcon className="w-6 h-6" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Usuarios</p>
                <p className="stat-value"></p>
              </div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="stat-icon">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Usuarios Activos</p>
                <p className="stat-value"></p>
              </div>
            </div>

            <div className="stat-card stat-card-warning">
              <div className="stat-icon">
                <UserX className="w-6 h-6" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Usuarios Inactivos</p>
                <p className="stat-value"></p>
              </div>
            </div>

            <div className="stat-card stat-card-info">
              <div className="stat-icon">
                <Shield className="w-6 h-6" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Administradores</p>
                <p className="stat-value"></p>
              </div>
            </div>
          </div>
        )}
      </div>
      <UsersFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        sports={sportSimple}
      />

      <UserList
        users={filteredUsers}
        onEdit={handleEditClick}
        onDelete={handleDeleteUser}
        onDetails={handleDetailsClick}
        onToggleActive={handleToggleActive}
      />

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          isOpen={showEditModal}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}

      {userForDetails && (
        <UserDetailsModal
          user={userForDetails}
          isOpen={true}
          onClose={handleCloseDetails}
        />
      )}

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateUser}
      />
    </div>
  );
};

export { Users };
