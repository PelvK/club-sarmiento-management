export interface Quote {
  id?: string;
  name: string;
  price: number;
  description: string;
  duration: number; // in months
  participants?: number;
}

export interface Sport {
  id: string;
  name: string;
  description: string;
  quotes?: Quote[];
  isPrincipal? : boolean;
  quoteId?: string /** @TODO refactor in the future, this is used in the edit modal */
  quoteName?: string /** @TODO refactor in the future, this is used in the view more modal */
}

/*
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  dni: string;
  sport: string;
  secondarySports?: string[];
  quoteId: string;
  joinDate: string;
  isFamilyHead?: boolean;
  familyHeadId?: string;
}
*/

export interface Member {
  id: string,
  dni: string,
  name: string,
  second_name: string,
  birthdate: string,
  active?: boolean,
  phone_number?: string,
  email?: string,
  sports?: Sport[],
  sports_submit?: SportSelection[],
  societary_cuote?: Quote,
  familyGroupStatus?: FAMILY_STATUS
  familyHeadId?: string,
}

export interface Payment {
  id: string;
  memberId: string;
  sportId: string;
  quoteId: string;
  amount: number;
  status: PAYMENT_STATUS ;
  dueDate: string;
  paidDate?: string;
}

export interface User {
  email: string;
  password: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export interface SportSelection {
  id: string;
  isPrimary: boolean;
  quoteId?: string;
}

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue'
}

export enum FAMILY_STATUS {
  HEAD = 'HEAD',
  MEMBER = 'MEMBER',
  NONE = 'NONE'
}