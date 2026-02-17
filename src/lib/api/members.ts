import { MemberFormData } from "../../components/modals/members/types";
import { Member } from "../types/member";
import { CONSOLE_LOG } from "../utils/consts";
import { BASE_API_URL } from "../utils/strings";
import { logError } from "../utils/errorHandler";

export type ToggleActiveResponse = {
  success: boolean;
  id: number;
  active: boolean;
};

export type DeleteResponse = {
  success: boolean;
  id: number;
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  member?: Member;
  message?: string;
}

/**
 * Helper para manejar respuestas de la API
 */
async function handleApiResponse<T>(
  response: Response,
  context: string,
): Promise<T> {
  const json = await response.json();

  if ("success" in json && json.success === false) {
    logError(json, context);
    throw json;
  }

  // Si el status HTTP no es ok pero no hay success: false
  if (!response.ok) {
    const error = {
      success: false,
      message: `Error HTTP ${response.status}: ${response.statusText}`,
    };
    logError(error, context);
    throw error;
  }

  return json;
}

export const membersApi = {
  async getAll(): Promise<Member[]> {
    const API = `${BASE_API_URL}/members/get_all.php`;

    try {
      const response = await fetch(API);
      const json = await handleApiResponse<Member[]>(response, "getAll");

      return json.map((member: Member) => {
        const {
          id,
          dni,
          name,
          second_name,
          birthdate,
          phone_number,
          email,
          societary_cuote,
          familyGroupStatus,
          familyHeadId,
          sports,
          active,
        } = member;

        return {
          id,
          dni,
          name,
          second_name,
          birthdate,
          phone_number,
          email,
          societary_cuote,
          familyGroupStatus,
          familyHeadId,
          sports,
          active,
        };
      });
    } catch (error) {
      logError(error, "getAll members");
      throw error;
    }
  },

  async getAllFamilyHeads(): Promise<Member[]> {
    const API = `${BASE_API_URL}/members/get_all_family_heads.php`;

    try {
      const response = await fetch(API);
      const json = await handleApiResponse<Member[]>(
        response,
        "getAllFamilyHeads",
      );

      return json.map((member: Member) => {
        const {
          id,
          dni,
          name,
          second_name,
          birthdate,
          phone_number,
          email,
          sports,
          active,
        } = member;

        return {
          id,
          dni,
          name,
          second_name,
          birthdate,
          phone_number,
          email,
          sports,
          active,
        };
      });
    } catch (error) {
      logError(error, "getAllFamilyHeads");
      throw error;
    }
  },

  async delete(id: number): Promise<number> {
    const API = `${BASE_API_URL}/members/delete.php`;

    try {
      const response = await fetch(API, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const json = await handleApiResponse<DeleteResponse>(
        response,
        "delete",
      );
      if (CONSOLE_LOG) {
        console.log("[API] id member sent: ", id);
      }

      if (!json.success) {
        throw {
          success: false,
          message: "No se pudo completar la eliminación del miembro",
        };
      }

      return json.id;
    } catch (error) {
      logError(error, "update member");
      throw error;
    }
  },

  async update(member: Member): Promise<Member> {
    const API = `${BASE_API_URL}/members/update.php`;

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...member,
        }),
      });

      const json = await handleApiResponse<ApiResponse<Member>>(
        response,
        "update",
      );

      if (CONSOLE_LOG) {
        console.log("[API] Member sent: ", member);
        console.log("[API] Updated member: ", json.member);
      }

      if (!json.member) {
        throw {
          success: false,
          message: "No se recibió el miembro actualizado del servidor",
        };
      }

      return json.member;
    } catch (error) {
      logError(error, "update member");
      throw error;
    }
  },

  async create(member: MemberFormData): Promise<Member> {
    const API = `${BASE_API_URL}/members/create.php`;

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...member,
        }),
      });

      const json = await handleApiResponse<ApiResponse<Member>>(
        response,
        "create",
      );

      if (CONSOLE_LOG) {
        console.log("[API] Member sent: ", member);
        console.log("[API] Created member: ", json.member);
      }

      if (!json.member) {
        throw {
          success: false,
          message: "No se recibió el miembro creado del servidor",
        };
      }

      return json.member;
    } catch (error) {
      logError(error, "create member");
      throw error;
    }
  },

  async toggleActive(
    id: number,
    isActive: boolean,
  ): Promise<ToggleActiveResponse> {
    const API = `${BASE_API_URL}/members/toggle_active.php`;

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          is_active: isActive,
        }),
      });

      const json = await handleApiResponse<ToggleActiveResponse>(
        response,
        "toggleActive",
      );

      if (!json.success) {
        throw {
          success: false,
          message: "No se pudo actualizar el estado",
        };
      }

      return json;
    } catch (error) {
      logError(error, "toggleActive");
      throw error;
    }
  },
};
