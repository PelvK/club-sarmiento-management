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

export type PreviewData = {
  onlySocietaryCount: number;
  onlySocietaryAmount: number;
  principalSportsCount: number;
  principalSportsAmount: number;
  secondarySportsCount: number;
  secondarySportsAmount: number;
  totalPayments: number;
  totalAmount: number;
  breakdown: MemberPaymentBreakdown[];
};