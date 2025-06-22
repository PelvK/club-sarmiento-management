import { type Payment, type PaymentGeneration, type PartialPayment, PAYMENT_STATUS } from '../../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for development
const mockPayments: Payment[] = [
  {
    id: '1',
    memberId: '1',
    memberName: 'Juan Pérez',
    sportId: '1',
    sportName: 'Fútbol',
    quoteId: '1',
    quoteName: 'Cuota Mensual',
    amount: 15000,
    status: PAYMENT_STATUS.PAID,
    dueDate: '2024-03-15',
    paidDate: '2024-03-10',
    type: 'sport',
    generationId: 'gen-2024-03'
  },
  {
    id: '2',
    memberId: '1',
    memberName: 'Juan Pérez',
    sportId: 'societary',
    sportName: 'Cuota Societaria',
    quoteId: 'soc-1',
    quoteName: 'Socio Activo',
    amount: 8000,
    status: PAYMENT_STATUS.PENDING,
    dueDate: '2024-04-01',
    type: 'societary',
    generationId: 'gen-2024-04'
  },
  {
    id: '3',
    memberId: '2',
    memberName: 'María García',
    sportId: '2',
    sportName: 'Básquet',
    quoteId: '4',
    quoteName: 'Cuota Juvenil',
    amount: 12000,
    status:  PAYMENT_STATUS.OVERDUE,
    dueDate: '2024-02-28',
    type: 'sport',
    generationId: 'gen-2024-02',
    tags: ['revisar']
  },
  {
    id: '4',
    memberId: '3',
    memberName: 'Carlos López',
    sportId: '1',
    sportName: 'Fútbol',
    quoteId: '2',
    quoteName: 'Cuota Promocional',
    amount: 10000,
    status: PAYMENT_STATUS.PARTIAL,
    dueDate: '2024-03-31',
    type: 'sport',
    generationId: 'gen-2024-03',
    partialPayments: [
      {
        id: 'pp-1',
        amount: 5000,
        paidDate: '2024-03-15',
        notes: 'Pago parcial'
      }
    ],
    tags: ['becado']
  }
];

const mockGenerations: PaymentGeneration[] = [
  {
    id: 'gen-2024-04',
    month: 4,
    year: 2024,
    generatedDate: '2024-03-25',
    totalAmount: 450000,
    totalPayments: 25,
    status: 'active',
    breakdown: {
      sportPayments: 18,
      societaryPayments: 7,
      totalSportAmount: 270000,
      totalSocietaryAmount: 180000
    }
  },
  {
    id: 'gen-2024-03',
    month: 3,
    year: 2024,
    generatedDate: '2024-02-28',
    totalAmount: 380000,
    totalPayments: 22,
    status: 'active',
    breakdown: {
      sportPayments: 16,
      societaryPayments: 6,
      totalSportAmount: 240000,
      totalSocietaryAmount: 140000
    }
  }
];

export const paymentsApi = {
  async getAll(): Promise<Payment[]> {
    await delay(500);
    return mockPayments;
  },

  async getByMember(memberId: string): Promise<Payment[]> {
    await delay(300);
    return mockPayments.filter(p => p.memberId === memberId);
  },

  async getBySport(sportId: string): Promise<Payment[]> {
    await delay(300);
    return mockPayments.filter(p => p.sportId === sportId);
  },

  async markAsPaid(id: string, amount?: number, notes?: string): Promise<Payment> {
    await delay(500);
    const payment = mockPayments.find(p => p.id === id);
    if (!payment) throw new Error('Payment not found');
    
    return {
      ...payment,
      status: PAYMENT_STATUS.PAID,
      paidDate: new Date().toISOString().split('T')[0],
      notes: notes || payment.notes
    };
  },

  async addPartialPayment(paymentId: string, amount: number, notes?: string): Promise<Payment> {
    await delay(500);
    const payment = mockPayments.find(p => p.id === paymentId);
    if (!payment) throw new Error('Payment not found');

    const partialPayment: PartialPayment = {
      id: `pp-${Date.now()}`,
      amount,
      paidDate: new Date().toISOString().split('T')[0],
      notes
    };

    const totalPaid = (payment.partialPayments || []).reduce((sum, pp) => sum + pp.amount, 0) + amount;
    const newStatus = totalPaid >= payment.amount ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PARTIAL;

    return {
      ...payment,
      status: newStatus,
      partialPayments: [...(payment.partialPayments || []), partialPayment],
      paidDate: newStatus === PAYMENT_STATUS.PAID ? new Date().toISOString().split('T')[0] : payment.paidDate
    };
  },

  async generatePayments(config: any): Promise<PaymentGeneration> {
    await delay(1000);
    
    const newGeneration: PaymentGeneration = {
      id: `gen-${config.year}-${config.month.toString().padStart(2, '0')}`,
      month: config.month,
      year: config.year,
      generatedDate: new Date().toISOString().split('T')[0],
      totalAmount: 500000,
      totalPayments: 30,
      status: 'active',
      breakdown: {
        sportPayments: 22,
        societaryPayments: 8,
        totalSportAmount: 330000,
        totalSocietaryAmount: 170000
      }
    };

    return newGeneration;
  },

  async getGenerations(): Promise<PaymentGeneration[]> {
    await delay(300);
    return mockGenerations;
  },

  async revertGeneration(generationId: string): Promise<void> {
    await delay(500);
    console.log(`Reverted generation: ${generationId}`);
  },

  async updatePayment(payment: Payment): Promise<Payment> {
    await delay(500);
    return payment;
  },

  async deletePayment(id: string): Promise<void> {
    await delay(500);
    console.log(`Deleted payment: ${id}`);
  }
};