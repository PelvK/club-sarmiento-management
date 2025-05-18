import type { Sport } from '../../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sportsApi = {
  async getAll(): Promise<Sport[]> {
    await delay(500);
    return [
      {
        id: '1',
        name: 'Football',
        description: 'Main football team',
        maxMembers: 25,
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
        maxMembers: 15,
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

  async create(sport: Omit<Sport, 'id'>): Promise<Sport> {
    await delay(500);
    return {
      ...sport,
      id: Math.random().toString(36).substr(2, 9)
    };
  }
};