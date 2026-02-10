import { MemberFormData } from "../../components/modals/members/types";
import { Member } from "../types/member";
import { BASE_API_URL } from "../utils/strings";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const membersApi = {
  async getAll(): Promise<Member[]> {
    const API = `${BASE_API_URL}/members/get_all.php`;
    const rawData = await fetch(API);
    const json = await rawData.json();

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
  },

  async getAllFamilyHeads(): Promise<Member[]> {
    const API = `${BASE_API_URL}/members/get_all_family_heads.php`;
    const rawData = await fetch(API);
    const json = await rawData.json();

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
  },

  async delete(id: number): Promise<void> {
    await delay(500);
    console.log(`Deleted member with id: ${id}`);
  },

  async update(member: Member): Promise<Member> {
    const API = `${BASE_API_URL}/members/update.php`;
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...member
      }),
    });

    if (!response.ok) {
      throw new Error("Error actualizando un miembro");
    }
    
    const json = await response.json();
    console.log("[API] Member sent: ", member);
    console.log("[API] Updated member: ", json.member);
    return json.member;
  },

  async create(
    member: MemberFormData,
  ): Promise<Member> {
    const API = `${BASE_API_URL}/members/create.php`;

    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...member
      }),
    });

    if (!response.ok) {
      throw new Error("Error creando un miembro");
    }
    
    const json = await response.json();
    console.log(json);
    return json.member;
  },
};
