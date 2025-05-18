import type { Member } from '../../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const membersApi = {
  async getAll(): Promise<Member[]> {
    await delay(500);
    return [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        dni: '12345678A',
        sport: 'Football',
        quoteId: '1',
        joinDate: '2024-01-15'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '123-456-7891',
        dni: '87654321B',
        sport: 'Basketball',
        quoteId: '4',
        joinDate: '2024-02-01'
      }
    ];
  },

  async delete(id: string): Promise<void> {
    await delay(500);
    console.log(`Deleted member with id: ${id}`);
  },

  async update(member: Member): Promise<Member> {
    await delay(500);
    return member;
  },

  async create(member: Omit<Member, 'id'>): Promise<Member> {
    await delay(500);
    return {
      ...member,
      id: Math.random().toString(36).substr(2, 9)
    };
  }
};