import type { Payment } from '../../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentsApi = {
  async getAll(): Promise<Payment[]> {
    await delay(500);
    return [
      {
        id: '1',
        memberId: '1',
        sportId: '1',
        quoteId: '1',
        amount: 50,
        status: 'paid',
        dueDate: '2024-03-15',
        paidDate: '2024-03-10'
      },
      {
        id: '2',
        memberId: '2',
        sportId: '2',
        quoteId: '4',
        amount: 45,
        status: 'pending',
        dueDate: '2024-04-01'
      }
    ];
  },

  async markAsPaid(id: string): Promise<Payment> {
    await delay(500);
    return {
      id,
      memberId: '1',
      sportId: '1',
      quoteId: '1',
      amount: 50,
      status: 'paid',
      dueDate: '2024-03-15',
      paidDate: new Date().toISOString()
    };
  }
};