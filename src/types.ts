export interface Quote {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: number; // in months
}

export interface Sport {
  id: string;
  name: string;
  description: string;
  maxMembers: number;
  quotes: Quote[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  dni: string;
  sport: string;
  quoteId: string;
  joinDate: string;
}

export interface Payment {
  id: string;
  memberId: string;
  sportId: string;
  quoteId: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
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