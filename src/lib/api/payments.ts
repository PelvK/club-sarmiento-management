import { PAYMENT_STATUS } from "../enums/PaymentStatus";
import { PartialPayment, Payment, PaymentGeneration } from "../types/payment";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockPayments: Payment[] = [
  {
    id: 1,
    member: {
      id: 101,
      name: "Juan Perez",
      dni: "12345678",
      second_name: "Pérez",
      birthdate: "1990-01-01",
    },
    sport: {
      id: 1,
      name: "Fútbol",
      description: "Deporte de equipo",
    },
    amount: 18000,
    status: PAYMENT_STATUS.PENDING,
    dueDate: "2024-04-10",
    paidDate: undefined,
    notes: "",
    partialPayments: [],
    type: "sport",
  },
  {
    id: 2,
    member: {
      id: 102,
      name: "Ana Gómez",
      dni: "87654321",
      second_name: "Gómez",
      birthdate: "1992-02-02",
    },
    sport: {
      id: 2,
      name: "Básquet",
      description: "Deporte de equipo",
    },
    amount: 15000,
    status: PAYMENT_STATUS.PAID,
    dueDate: "2024-04-10",
    paidDate: "2024-04-05",
    notes: "Pagado en ventanilla",
    partialPayments: [],
    type: "sport",
  },
  {
    id: 3,
    member: {
      id: 103,
      name: "Carlos Díaz",
      dni: "13579246",
      second_name: "Díaz",
      birthdate: "1995-03-03",
    },
    sport: {
      id: 1,
      name: "Fútbol",
      description: "",
    },
    amount: 12000,
    status: PAYMENT_STATUS.PARTIAL,
    dueDate: "2024-04-10",
    paidDate: undefined,
    notes: "Pagó la mitad",
    partialPayments: [
      {
        id: 1,
        amount: 6000,
        paidDate: "2024-04-03",
        notes: "Primer pago",
        paymentId: 0,
      },
    ],
    type: "sport",
  },
];

const mockGenerations: PaymentGeneration[] = [
  {
    id: "gen-2024-04",
    month: 4,
    year: 2024,
    generatedDate: "2024-03-25",
    totalAmount: 450000,
    totalPayments: 25,
    status: "active",
    breakdown: {
      sportPayments: 18,
      societaryPayments: 7,
      totalSportAmount: 270000,
      totalSocietaryAmount: 180000,
    },
  },
  {
    id: "gen-2024-03",
    month: 3,
    year: 2024,
    generatedDate: "2024-02-28",
    totalAmount: 380000,
    totalPayments: 22,
    status: "active",
    breakdown: {
      sportPayments: 16,
      societaryPayments: 6,
      totalSportAmount: 240000,
      totalSocietaryAmount: 140000,
    },
  },
];

export const paymentsApi = {
  async getAll(): Promise<Payment[]> {
    await delay(500);
    return mockPayments;
  },

  async getByMember(memberId: number): Promise<Payment[]> {
    await delay(300);
    return mockPayments.filter((p) => p.member.id === memberId);
  },

  async getBySport(sportId: number): Promise<Payment[]> {
    await delay(300);
    return mockPayments.filter((p) => p.sport.id === sportId);
  },

  async markAsPaid(
    id: number,
    amount?: number,
    notes?: string
  ): Promise<Payment> {
    await delay(500);
    const payment = mockPayments.find((p) => p.id === id);
    if (!payment) throw new Error("Payment not found");

    return {
      ...payment,
      status: PAYMENT_STATUS.PAID,
      paidDate: new Date().toISOString().split("T")[0],
      notes: notes || payment.notes,
    };
  },

  async addPartialPayment(
    paymentId: number,
    amount: number,
    notes?: string
  ): Promise<Payment> {
    await delay(500);
    const payment = mockPayments.find((p) => p.id === paymentId);
    if (!payment) throw new Error("Payment not found");

    const partialPayment: PartialPayment = {
      id: Date.now(),
      amount,
      paidDate: new Date().toISOString().split("T")[0],
      notes,
      paymentId: payment.id
    };

    const totalPaid =
      (payment.partialPayments || []).reduce((sum, pp) => sum + pp.amount, 0) +
      amount;
    const newStatus =
      totalPaid >= payment.amount
        ? PAYMENT_STATUS.PAID
        : PAYMENT_STATUS.PARTIAL;

    return {
      ...payment,
      status: newStatus,
      partialPayments: [...(payment.partialPayments || []), partialPayment],
      paidDate:
        newStatus === PAYMENT_STATUS.PAID
          ? new Date().toISOString().split("T")[0]
          : payment.paidDate,
    };
  },

  async generatePayments(config: any): Promise<PaymentGeneration> {
    await delay(1000);

    const newGeneration: PaymentGeneration = {
      id: `gen-${config.year}-${config.month.toString().padStart(2, "0")}`,
      month: config.month,
      year: config.year,
      generatedDate: new Date().toISOString().split("T")[0],
      totalAmount: 500000,
      totalPayments: 30,
      status: "active",
      breakdown: {
        sportPayments: 22,
        societaryPayments: 8,
        totalSportAmount: 330000,
        totalSocietaryAmount: 170000,
      },
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
  },
};
