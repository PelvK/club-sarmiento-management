import type { Sport } from "../../types";
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
      const { id, name, description, quotes, isPrincipal} = sport;

      return {
        id,
        name,
        description,
        quotes,
        isPrincipal
      };
    });

    return [
      {
        id: '1',
        name: 'Football',
        description: 'Main football team',
        quotes: [
          {
            id: '1',
            name: 'Monthly',
            price: 50,
            description: 'Basic monthly membership',
            duration: 1
          },
          {
            id: '2',
            name: 'Quarterly',
            price: 135,
            description: 'Save 10% with quarterly membership',
            duration: 3
          },
          {
            id: '3',
            name: 'Annual',
            price: 480,
            description: 'Save 20% with annual membership',
            duration: 12
          }
        ]
      },
      {
        id: '2',
        name: 'Basketball',
        description: 'Basketball division',
        quotes: [
          {
            id: '4',
            name: 'Monthly',
            price: 45,
            description: 'Basic monthly membership',
            duration: 1
          },
          {
            id: '5',
            name: 'Annual',
            price: 432,
            description: 'Save 20% with annual membership',
            duration: 12
          }
        ]
      }
    ];
  },

  async delete(id: string): Promise<void> {
    await delay(500);
    console.log(`Deleted sport with id: ${id}`);
  },

  async update(sport: Sport): Promise<Sport> {
    await delay(500);
    return sport;
  },

  async create(sport: Omit<Sport, "id">): Promise<Sport> {
    await delay(500);
    return {
      ...sport,
      id: Math.random().toString(36).substr(2, 9),
    };
  },
};
