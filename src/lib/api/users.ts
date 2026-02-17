import { User, CreateUserRequest, UpdateUserRequest } from "../types/auth";
import { CONSOLE_LOG } from "../utils/consts";
import { BASE_API_URL } from "../utils/strings";

export const usersApi = {
  async getAll(): Promise<User[]> {
    const API = `${BASE_API_URL}/users/get_all.php`;
    const rawData = await fetch(API);
    const json = await rawData.json();

    return json.users.map((user: User) => {
      const {
        id,
        email,
        username,
        password,
        is_admin,
        is_active,
        created_at,
        sport_supported,
        permissions,
      } = user;

      return {
        id,
        email,
        username,
        password,
        is_admin,
        is_active,
        created_at,
        sport_supported,
        permissions,
      };
    });
  },

  async getById(id: string): Promise<User> {
    const API = `${BASE_API_URL}/users/get_by_id.php?id=${id}`;
    const rawData = await fetch(API);
    const json = await rawData.json();
    return json.user;
  },

  async delete(id: string): Promise<void> {
    const API = `${BASE_API_URL}/users/delete.php`;
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error("Error eliminando usuario");
    }
  },

  async update(id: string, user: UpdateUserRequest): Promise<User> {
    const API = `${BASE_API_URL}/users/update.php`;
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        ...user,
      }),
    });

    if (!response.ok) {
      throw new Error("Error actualizando usuario");
    }

    const json = await response.json();
    if (CONSOLE_LOG) {
      console.log("[API] Updated user: ", json.user);
    }
    return json.user;
  },

  async create(user: CreateUserRequest): Promise<User> {
    const API = `${BASE_API_URL}/users/create.php`;
    console.log(user);
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...user,
      }),
    });

    if (!response.ok) {
      throw new Error("Error creando usuario");
    }

    const json = await response.json();
    if (CONSOLE_LOG) {
      console.log("[API] Created user: ", json.user);
    }
    return json.user;
  },

  async toggleActive(id: string, isActive: boolean): Promise<User> {
    const API = `${BASE_API_URL}/users/toggle_active.php`;
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        is_active: isActive,
      }),
    });


    if (!response.ok) {
      throw new Error("Error cambiando estado del usuario");
    }

    const json = await response.json();
    return json.user;
  },
};
