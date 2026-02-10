import { useMemo } from 'react';
import { Member } from '../lib/types/member';
import { GenerationConfig } from '../lib/types/quote';

interface BreakdownItem {
  type: 'sport' | 'societary';
  memberId: number;
  memberName: string;
  concept: string;
  amount: number;
}

interface Payment {
  type: 'societary-only' | 'principal-sport' | 'secondary-sport';
  amount: number;
  description: string;
  breakdown?: {
    items: BreakdownItem[];
    total: number;
  };
}

interface MemberPayment {
  member: Member;
  payments: Payment[];
}

interface PreviewData {
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

export const usePaymentCalculation = (
  filteredMembers: Member[],
  config: GenerationConfig
): PreviewData => {
  return useMemo(() => {
    let onlySocietaryCount = 0;
    let onlySocietaryAmount = 0;
    let principalSportsCount = 0;
    let principalSportsAmount = 0;
    let secondarySportsCount = 0;
    let secondarySportsAmount = 0;

    const breakdown: MemberPayment[] = filteredMembers
      .map((member) => {
        const memberSports =
          member.sports?.filter(
            (sport) =>
              config.selectedSports.length === 0 ||
              config.selectedSports.includes(sport.id)
          ) || [];

        const payments: Payment[] = [];

        // CASO 1: Sin disciplinas (solo societaria)
        if (
          memberSports.length === 0 &&
          config.includeSocietary &&
          member.societary_cuote
        ) {
          const amount = Number(member.societary_cuote.price);
          payments.push({
            type: 'societary-only',
            amount: amount,
            description: 'Cuota Societaria',
          });
          onlySocietaryCount++;
          onlySocietaryAmount += amount;
        }
        // CASO 2: Con disciplinas
        else if (memberSports.length > 0) {
          memberSports.forEach((sport) => {
            const customAmount = config.customAmounts[`${member.id}-${sport.id}`];
            const sportAmount = Number(
              customAmount || sport.quotes?.[0]?.price || 0
            );

            // DISCIPLINA PRINCIPAL
            if (sport.isPrincipal) {
              const breakdownItems: BreakdownItem[] = [];

              // Item 1: Cuota deportiva
              breakdownItems.push({
                type: 'sport',
                memberId: member.id,
                memberName: `${member.name} ${member.second_name}`,
                concept: sport.name,
                amount: sportAmount,
              });

              let totalAmount = sportAmount;

              // Item 2: Cuota societaria (si aplica)
              if (config.includeSocietary && member.societary_cuote) {
                const societaryAmount = Number(member.societary_cuote.price);
                breakdownItems.push({
                  type: 'societary',
                  memberId: member.id,
                  memberName: `${member.name} ${member.second_name}`,
                  concept: 'Cuota Societaria',
                  amount: societaryAmount,
                });
                totalAmount += societaryAmount;
              }

              payments.push({
                type: 'principal-sport',
                amount: totalAmount,
                description: sport.name,
                breakdown: {
                  items: breakdownItems,
                  total: totalAmount,
                },
              });

              principalSportsCount++;
              principalSportsAmount += totalAmount;
            }
            // DISCIPLINA SECUNDARIA
            else if (config.includeNonPrincipalSports) {
              payments.push({
                type: 'secondary-sport',
                amount: sportAmount,
                description: sport.name,
              });
              secondarySportsCount++;
              secondarySportsAmount += sportAmount;
            }
          });
        }

        return { member, payments };
      })
      .filter((item) => item.payments.length > 0);

    const totalPayments =
      onlySocietaryCount + principalSportsCount + secondarySportsCount;
    const totalAmount =
      onlySocietaryAmount + principalSportsAmount + secondarySportsAmount;

    return {
      onlySocietaryCount,
      onlySocietaryAmount,
      principalSportsCount,
      principalSportsAmount,
      secondarySportsCount,
      secondarySportsAmount,
      totalPayments,
      totalAmount,
      breakdown,
    };
  }, [filteredMembers, config]);
};