import { Sport } from "../types/sport";
import { CONSOLE_LOG } from "../utils/consts";
import { BASE_API_URL } from "../utils/strings";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const sportsApi = {
  async getAllSimpleData(): Promise<Sport[]> {
    const API = `${BASE_API_URL}/sports/get_all_simple_data.php`;
    const rawData = await fetch(API);
    const json = await rawData.json();

    return json.map((sport: Sport) => {
      const { id, name, description } = sport;

      return {
        id,
        name,
        description,
      };
    });
  },

  async getAll(): Promise<Sport[]> {
    const API = `${BASE_API_URL}/sports/get_all.php`;
    const rawData = await fetch(API);
    const json = await rawData.json();

    return json.map((sport: Sport) => {
      const { id, name, description, quotes, isPrincipal } = sport;

      return {
        id,
        name,
        description,
        quotes,
        isPrincipal,
      };
    });
  },

  async delete(id: number): Promise<void> {
    await delay(500);
    if (CONSOLE_LOG) {
      console.log(`Deleted sport with id: ${id}`);
    }
  },

  async update(sport: Sport): Promise<Sport> {
    const API = `${BASE_API_URL}/sports/update.php`;

    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...sport,
      }),
    });

    if (!response.ok) {
      throw new Error("Error actualizando un deporte");
    }

    const json = await response.json();
    if (CONSOLE_LOG) {
      console.log(json);
    }
    return json.sport;
  },

  async create(sport: Omit<Sport, "id">): Promise<Sport> {
    const API = `${BASE_API_URL}/sports/create.php`;
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...sport,
      }),
    });
    if (!response.ok) {
      throw new Error("Error creando una disciplina");
    }
    const json = await response.json();
    if (CONSOLE_LOG) {
      console.log(json);
    }
    return json.sport;
  },
};
