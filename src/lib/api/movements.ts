import { type PaymentMovement, MOVEMENT_TYPE } from '../../types';
import { PAYMENT_STATUS } from '../enums/PaymentStatus';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for development
const mockMovements: PaymentMovement[] = [
  {
    id: 'mov-1',
    paymentId: '1',
    memberName: 'Juan Pérez',
    memberDni: '12345678',
    sportName: 'Fútbol',
    quoteName: 'Cuota Mensual',
    movementType: MOVEMENT_TYPE.CREATED,
    newStatus: PAYMENT_STATUS.PENDING,
    amount: 15000,
    timestamp: '2024-03-01T10:00:00Z',
    notes: 'Cuota generada automáticamente',
    userName: 'Sistema'
  },
  {
    id: 'mov-2',
    paymentId: '1',
    memberName: 'Juan Pérez',
    memberDni: '12345678',
    sportName: 'Fútbol',
    quoteName: 'Cuota Mensual',
    movementType: MOVEMENT_TYPE.FULL_PAYMENT,
    previousStatus: PAYMENT_STATUS.PENDING,
    newStatus: PAYMENT_STATUS.PAID,
    amount: 15000,
    partialAmount: 15000,
    timestamp: '2024-03-10T14:30:00Z',
    notes: 'Pago completo registrado',
    userName: 'Admin Usuario'
  },
  {
    id: 'mov-3',
    paymentId: '4',
    memberName: 'Carlos López',
    memberDni: '87654321',
    sportName: 'Fútbol',
    quoteName: 'Cuota Promocional',
    movementType: MOVEMENT_TYPE.CREATED,
    newStatus: PAYMENT_STATUS.PENDING,
    amount: 10000,
    timestamp: '2024-03-01T10:00:00Z',
    notes: 'Cuota generada automáticamente',
    userName: 'Sistema'
  },
  {
    id: 'mov-4',
    paymentId: '4',
    memberName: 'Carlos López',
    memberDni: '87654321',
    sportName: 'Fútbol',
    quoteName: 'Cuota Promocional',
    movementType: MOVEMENT_TYPE.PARTIAL_PAYMENT,
    previousStatus: PAYMENT_STATUS.PENDING,
    newStatus: PAYMENT_STATUS.PARTIAL,
    amount: 10000,
    partialAmount: 5000,
    timestamp: '2024-03-15T16:45:00Z',
    notes: 'Pago parcial registrado',
    userName: 'Admin Usuario'
  },
  {
    id: 'mov-5',
    paymentId: '2',
    memberName: 'Juan Pérez',
    memberDni: '12345678',
    sportName: 'Cuota Societaria',
    quoteName: 'Socio Activo',
    movementType: MOVEMENT_TYPE.CREATED,
    newStatus: PAYMENT_STATUS.PENDING,
    amount: 8000,
    timestamp: '2024-04-01T10:00:00Z',
    notes: 'Cuota generada automáticamente',
    userName: 'Sistema'
  },
  {
    id: 'mov-6',
    paymentId: '3',
    memberName: 'María García',
    memberDni: '11223344',
    sportName: 'Básquet',
    quoteName: 'Cuota Juvenil',
    movementType: MOVEMENT_TYPE.CREATED,
    newStatus: PAYMENT_STATUS.PENDING,
    amount: 12000,
    timestamp: '2024-02-01T10:00:00Z',
    notes: 'Cuota generada automáticamente',
    userName: 'Sistema'
  },
  {
    id: 'mov-7',
    paymentId: '3',
    memberName: 'María García',
    memberDni: '11223344',
    sportName: 'Básquet',
    quoteName: 'Cuota Juvenil',
    movementType: MOVEMENT_TYPE.STATUS_CHANGE,
    previousStatus: PAYMENT_STATUS.PENDING,
    newStatus: PAYMENT_STATUS.OVERDUE,
    amount: 12000,
    timestamp: '2024-03-01T00:00:00Z',
    notes: 'Cuota vencida automáticamente',
    userName: 'Sistema'
  }
];

export const movementsApi = {
  async getAll(): Promise<PaymentMovement[]> {
    await delay(500);
    return mockMovements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async getByPayment(paymentId: string): Promise<PaymentMovement[]> {
    await delay(300);
    return mockMovements
      .filter(m => m.paymentId === paymentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async getByMember(memberName: string, memberDni?: string): Promise<PaymentMovement[]> {
    await delay(300);
    return mockMovements
      .filter(m => 
        m.memberName.toLowerCase().includes(memberName.toLowerCase()) ||
        (memberDni && m.memberDni.includes(memberDni))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async create(movement: Omit<PaymentMovement, 'id' | 'timestamp'>): Promise<PaymentMovement> {
    await delay(300);
    const newMovement: PaymentMovement = {
      ...movement,
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    return newMovement;
  }
};