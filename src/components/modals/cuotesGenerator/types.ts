import { Member } from "../../../lib/types/member";

export type PaymentDetail = {
  type: 'societary-only' | 'principal-sport' | 'secondary-sport';
  sportId?: number;
  sportName?: string;
  amount: number;
  description: string;
  breakdown?: {
    headSocietary: number;
    headSport: number;
    dependents: Array<{
      memberId: number;
      memberName: string;
      societaryAmount: number;
      sportAmount: number;
    }>;
  };
};

export type MemberPaymentBreakdown = {
  member: Member;
  payments: PaymentDetail[];
  totalAmount: number;
};

export interface Payment {
  type: 'societary-only' | 'principal-sport' | 'secondary-sport';
  amount: number;
  description: string;
  breakdown?: {
    items: BreakdownItem[];
    total: number;
  };
}

export interface MemberPayment {
  member: Member;
  payments: Payment[];
}

export interface PreviewData {
  onlySocietaryCount: number;
  onlySocietaryAmount: number;
  principalSportsCount: number;
  principalSportsAmount: number;
  secondarySportsCount: number;
  secondarySportsAmount: number;
  totalPayments: number;
  totalAmount: number;
  breakdown: MemberPayment[];
}

export interface BreakdownItem {
  type: 'sport' | 'societary';
  memberId: number;
  memberName: string;
  concept: string;
  amount: number;
}
