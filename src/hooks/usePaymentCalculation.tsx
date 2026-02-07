import { useMemo } from "react";
import { PreviewData, MemberPaymentBreakdown, PaymentDetail } from "../components/modals/cuotesGenerator/types";
import { GenerationConfig } from "../lib/types/quote";
import { Member } from "../lib/types/member";
import { FAMILY_STATUS } from "../lib/enums/SportSelection";

export const usePaymentCalculation = (
  filteredMembers: Member[],
  config: GenerationConfig
): PreviewData => {
  return useMemo(() => {
    // Tracking de cuotas ya procesadas por miembro-deporte
    const processedMemberSports = new Set<string>();
    
    // Counters
    let onlySocietaryCount = 0;
    let onlySocietaryAmount = 0;
    let principalSportsCount = 0;
    let principalSportsAmount = 0;
    let secondarySportsCount = 0;
    let secondarySportsAmount = 0;

    // Resultado final
    const breakdown: MemberPaymentBreakdown[] = [];

    // Helper: obtener monto de deporte (custom o default)
    const getSportAmount = (memberId: number, sportId: number, defaultPrice?: number) => {
      const customAmount = config.customAmounts[`${memberId}-${sportId}`];
      return customAmount !== undefined ? customAmount : (defaultPrice || 0);
    };

    // Helper: obtener dependientes de un HEAD (hijos en su grupo familiar)
    const getDependents = (headId: number): Member[] => {
      return filteredMembers.filter(member => 
        member.familyGroupStatus === FAMILY_STATUS.MEMBER &&
        member.familyHeadId === headId
      );
    };

    // Procesar cada miembro (solo HEADs y NONEs)
    filteredMembers.forEach((member) => {
      // Skip si es dependiente (será procesado con su head)
      if (member.familyGroupStatus === FAMILY_STATUS.MEMBER) {
        return;
      }

      const memberSports = member.sports?.filter(
        (sport) =>
          config.selectedSports.length === 0 ||
          config.selectedSports.includes(sport.id)
      ) || [];

      const memberPayments: PaymentDetail[] = [];

      // CASO 1: Socio sin disciplinas (solo societaria)
      if (memberSports.length === 0) {
        if (config.includeSocietary && member.societary_cuote) {
          const amount = Number(member.societary_cuote.price);
          
          memberPayments.push({
            type: 'societary-only',
            amount,
            description: 'Cuota Societaria',
          });

          onlySocietaryCount++;
          onlySocietaryAmount += amount;
        }
      } 
      // CASO 2: Socio con disciplinas
      else {
        memberSports.forEach((sport) => {
          const memberSportKey = `${member.id}-${sport.id}`;
          
          // Skip si ya fue procesado
          if (processedMemberSports.has(memberSportKey)) return;

          const sportAmount = getSportAmount(
            member.id, 
            sport.id, 
            sport.quotes?.[0]?.price
          );

          // DISCIPLINA PRINCIPAL
          if (sport.isPrincipal) {
            let totalAmount = 0;
            let description = sport.name;

            // Si es HEAD, incluir dependientes que heredan esta disciplina
            if (member.familyGroupStatus === FAMILY_STATUS.HEAD) {
              const dependents = getDependents(member.id);
              
              const breakdown = {
                headSocietary: 0,
                headSport: Number(sportAmount),
                dependents: [] as Array<{
                  memberId: number;
                  memberName: string;
                  societaryAmount: number;
                  sportAmount: number;
                }>,
              };

              // Cuota societaria del head
              if (config.includeSocietary && member.societary_cuote) {
                breakdown.headSocietary = Number(member.societary_cuote.price);
              }

              totalAmount = breakdown.headSocietary + breakdown.headSport;

              // Agregar dependientes (que heredan esta disciplina principal)
              dependents.forEach(dep => {
                // El dependiente tiene esta disciplina porque hereda del HEAD
                const depSport = dep.sports?.find(s => s.id === sport.id);
                
                if (depSport) {
                  const depSportAmount = getSportAmount(
                    dep.id,
                    sport.id,
                    depSport.quotes?.[0]?.price
                  );

                  let depSocietaryAmount = 0;
                  if (config.includeSocietary && dep.societary_cuote) {
                    depSocietaryAmount = Number(dep.societary_cuote.price);
                  }

                  breakdown.dependents.push({
                    memberId: dep.id,
                    memberName: `${dep.name} ${dep.second_name}`,
                    societaryAmount: depSocietaryAmount,
                    sportAmount: Number(depSportAmount),
                  });

                  totalAmount += depSocietaryAmount + Number(depSportAmount);

                  // Marcar disciplina principal del dependiente como procesada
                  processedMemberSports.add(`${dep.id}-${sport.id}`);
                }
              });

              // Calcular cuántas societarias están incluidas
              const societariesIncluded = 
                (config.includeSocietary && member.societary_cuote ? 1 : 0) +
                breakdown.dependents.filter(dep => dep.societaryAmount > 0).length;

              if (breakdown.dependents.length > 0) {
                const dependentsText = breakdown.dependents.length > 1 
                  ? `${breakdown.dependents.length} dependientes` 
                  : '1 dependiente';
                const societariesText = societariesIncluded > 0 
                  ? ` + ${societariesIncluded} societaria${societariesIncluded > 1 ? 's' : ''}` 
                  : '';
                description = `${sport.name} (Principal + ${dependentsText}${societariesText})`;
              } else {
                description = config.includeSocietary && member.societary_cuote
                  ? `${sport.name} (Principal + 1 societaria)`
                  : `${sport.name} (Principal)`;
              }

              memberPayments.push({
                type: 'principal-sport',
                sportId: sport.id,
                sportName: sport.name,
                amount: totalAmount,
                description,
                breakdown,
              });

              principalSportsCount++;
              principalSportsAmount += totalAmount;
            } 
            // Si NO es HEAD (es NONE), cuota normal
            else {
              if (config.includeSocietary && member.societary_cuote) {
                totalAmount += Number(member.societary_cuote.price);
                description += ' (Principal + Societaria)';
              } else {
                description += ' (Principal)';
              }
              totalAmount += Number(sportAmount);

              memberPayments.push({
                type: 'principal-sport',
                sportId: sport.id,
                sportName: sport.name,
                amount: totalAmount,
                description,
              });

              principalSportsCount++;
              principalSportsAmount += totalAmount;
            }
          } 
          // DISCIPLINA SECUNDARIA
          else if (config.includeNonPrincipalSports) {
            memberPayments.push({
              type: 'secondary-sport',
              sportId: sport.id,
              sportName: sport.name,
              amount: Number(sportAmount),
              description: sport.name,
            });

            secondarySportsCount++;
            secondarySportsAmount += Number(sportAmount);
          }

          processedMemberSports.add(memberSportKey);
        });
      }

      // Agregar miembro al breakdown si tiene pagos
      if (memberPayments.length > 0) {
        breakdown.push({
          member,
          payments: memberPayments,
          totalAmount: memberPayments.reduce((sum, p) => sum + p.amount, 0),
        });
      }
    });

    // Ahora procesar MEMBERS que tienen disciplinas adicionales (NO la principal heredada)
    filteredMembers.forEach((member) => {
      if (member.familyGroupStatus !== FAMILY_STATUS.MEMBER) return;

      const memberSports = member.sports?.filter(
        (sport) =>
          (config.selectedSports.length === 0 || config.selectedSports.includes(sport.id)) &&
          !processedMemberSports.has(`${member.id}-${sport.id}`)
      ) || [];

      if (memberSports.length === 0) return;

      const memberPayments: PaymentDetail[] = [];

      memberSports.forEach((sport) => {
        const sportAmount = getSportAmount(
          member.id,
          sport.id,
          sport.quotes?.[0]?.price
        );

        memberPayments.push({
          type: 'secondary-sport',
          sportId: sport.id,
          sportName: sport.name,
          amount: Number(sportAmount),
          description: sport.name,
        });

        secondarySportsCount++;
        secondarySportsAmount += Number(sportAmount);

        processedMemberSports.add(`${member.id}-${sport.id}`);
      });

      if (memberPayments.length > 0) {
        breakdown.push({
          member,
          payments: memberPayments,
          totalAmount: memberPayments.reduce((sum, p) => sum + p.amount, 0),
        });
      }
    });

    const totalPayments = onlySocietaryCount + principalSportsCount + secondarySportsCount;
    const totalAmount = onlySocietaryAmount + principalSportsAmount + secondarySportsAmount;

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