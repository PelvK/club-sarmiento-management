import { useMemo } from "react";
import { Member } from "../lib/types/member";
import { GenerationConfig } from "../lib/types/quote";
import { FAMILY_STATUS } from "../lib/enums/SportSelection";
import { PAYMENT_TYPE, BREAKDOWN_TYPE } from "../lib/enums/PaymentStatus";
import { PreviewData, MemberPaymentBreakdown, BreakdownItem } from "../lib/types/payment";

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

    // Helper: obtener dependientes de un HEAD
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

      const memberPayments: MemberPaymentBreakdown['payments'] = [];

      // CASO 1: Socio sin disciplinas (solo societaria)
      if (memberSports.length === 0) {
        if (config.includeSocietary && member.societary_cuote) {
          const amount = Number(member.societary_cuote.price);
          
          const breakdownItems: BreakdownItem[] = [{
            type: BREAKDOWN_TYPE.SOCIETARY,
            memberId: member.id,
            memberName: `${member.name} ${member.second_name}`,
            concept: 'Cuota Societaria',
            description: member.societary_cuote.name || '(N/N)',
            amount: amount,
          }];
          
          memberPayments.push({
            type: PAYMENT_TYPE.SOCIETARY_ONLY,
            amount,
            description: 'Cuota Societaria',
            breakdown: {
              items: breakdownItems,
              total: amount,
            },
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
            const breakdownItems: BreakdownItem[] = [];

            // Si es HEAD, incluir dependientes
            if (member.familyGroupStatus === FAMILY_STATUS.HEAD) {
              const dependents = getDependents(member.id);
              
              // Agregar items del HEAD
              if (config.includeSocietary && member.societary_cuote) {
                breakdownItems.push({
                  type: BREAKDOWN_TYPE.SOCIETARY,
                  memberId: member.id,
                  memberName: `${member.name} ${member.second_name}`,
                  concept: 'Cuota Societaria',
                  description: member.societary_cuote.name || '(N/N)',
                  amount: Number(member.societary_cuote.price),
                });
                totalAmount += Number(member.societary_cuote.price);
              }
              
              breakdownItems.push({
                type: BREAKDOWN_TYPE.PRINCIPAL_SPORT,
                memberId: member.id,
                memberName: `${member.name} ${member.second_name}`,
                concept: 'Cuota Deportiva',
                description: sport.quotes?.[0]?.name || sport.name,
                amount: Number(sportAmount),
              });
              totalAmount += Number(sportAmount);

              // Agregar items de dependientes
              dependents.forEach(dep => {
                const depSport = dep.sports?.find(s => s.id === sport.id);
                
                if (depSport) {
                  const depSportAmount = getSportAmount(
                    dep.id,
                    sport.id,
                    depSport.quotes?.[0]?.price
                  );

                  // Cuota societaria del dependiente
                  if (config.includeSocietary && dep.societary_cuote) {
                    breakdownItems.push({
                      type: BREAKDOWN_TYPE.SOCIETARY,
                      memberId: dep.id,
                      memberName: `${dep.name} ${dep.second_name}`,
                      concept: 'Cuota Societaria',
                      description: dep.societary_cuote.name || '(N/N)',
                      amount: Number(dep.societary_cuote.price),
                    });
                    totalAmount += Number(dep.societary_cuote.price);
                  }

                  // Cuota deportiva del dependiente
                  breakdownItems.push({
                    type: BREAKDOWN_TYPE.PRINCIPAL_SPORT,
                    memberId: dep.id,
                    memberName: `${dep.name} ${dep.second_name}`,
                    concept: 'Cuota Deportiva',
                    
                    amount: Number(depSportAmount),
                  });
                  totalAmount += Number(depSportAmount);

                  // Marcar disciplina principal del dependiente como procesada
                  processedMemberSports.add(`${dep.id}-${sport.id}`);
                }
              });

              // Generar descripción
              const societariesIncluded = breakdownItems.filter(
                item => item.type === BREAKDOWN_TYPE.SOCIETARY
              ).length;

              if (dependents.length > 0) {
                const depCount = dependents.filter(dep => 
                  dep.sports?.some(s => s.id === sport.id)
                ).length;
                const depText = depCount > 1 ? `${depCount} dependientes` : "1 dependiente";
                const socText = societariesIncluded > 0 
                  ? ` + ${societariesIncluded} societaria${societariesIncluded > 1 ? 's' : ''}` 
                  : '';
                description = `${sport.name} (Principal + ${depText}${socText})`;
              } else {
                description = societariesIncluded > 0
                  ? `${sport.name} (Principal + ${societariesIncluded} societaria${societariesIncluded > 1 ? 's' : ''})`
                  : `${sport.name} (Principal)`;
              }

              memberPayments.push({
                type: PAYMENT_TYPE.PRINCIPAL_SPORT,
                sportId: sport.id,
                sportName: sport.name,
                amount: totalAmount,
                description,
                breakdown: {
                  items: breakdownItems,
                  total: totalAmount,
                },
              });

              principalSportsCount++;
              principalSportsAmount += totalAmount;
            } 
            // Si NO es HEAD (es NONE)
            else {
              // Agregar items del socio individual
              if (config.includeSocietary && member.societary_cuote) {
                breakdownItems.push({
                  type: BREAKDOWN_TYPE.SOCIETARY,
                  memberId: member.id,
                  memberName: `${member.name} ${member.second_name}`,
                  concept: 'Cuota Societaria',
                  description: member.societary_cuote.name || '(N/N)',
                  amount: Number(member.societary_cuote.price),
                });
                totalAmount += Number(member.societary_cuote.price);
                description += ' (Principal + Societaria)';
              } else {
                description += ' (Principal)';
              }
              
              breakdownItems.push({
                type: BREAKDOWN_TYPE.PRINCIPAL_SPORT,
                memberId: member.id,
                memberName: `${member.name} ${member.second_name}`,
                concept: 'Cuota Deportiva',
                description: sport.quotes?.[0]?.name || sport.name,
                amount: Number(sportAmount),
              });
              totalAmount += Number(sportAmount);

              memberPayments.push({
                type: PAYMENT_TYPE.PRINCIPAL_SPORT,
                sportId: sport.id,
                sportName: sport.name,
                amount: totalAmount,
                description,
                breakdown: {
                  items: breakdownItems,
                  total: totalAmount,
                },
              });

              principalSportsCount++;
              principalSportsAmount += totalAmount;
            }
          } 
          // DISCIPLINA SECUNDARIA
          else if (config.includeNonPrincipalSports) {
            const breakdownItems: BreakdownItem[] = [{
              type: BREAKDOWN_TYPE.SECONDARY_SPORT,
              memberId: member.id,
              memberName: `${member.name} ${member.second_name}`,
              concept: 'Cuota Deportiva',
              description: sport.quotes?.[0]?.name || sport.name,
              amount: Number(sportAmount),
            }];

            memberPayments.push({
              type: PAYMENT_TYPE.SECONDARY_SPORT,
              sportId: sport.id,
              sportName: sport.name,
              amount: Number(sportAmount),
              description: sport.name,
              breakdown: {
                items: breakdownItems,
                total: Number(sportAmount),
              },
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

    // Procesar MEMBERs con disciplinas adicionales (NO la principal heredada)
    filteredMembers.forEach((member) => {
      if (member.familyGroupStatus !== FAMILY_STATUS.MEMBER) return;

      const memberSports = member.sports?.filter(
        (sport) =>
          (config.selectedSports.length === 0 || config.selectedSports.includes(sport.id)) &&
          !processedMemberSports.has(`${member.id}-${sport.id}`)
      ) || [];

      if (memberSports.length === 0) return;

      const memberPayments: MemberPaymentBreakdown['payments'] = [];

      memberSports.forEach((sport) => {
        const sportAmount = getSportAmount(
          member.id,
          sport.id,
          sport.quotes?.[0]?.price
        );

        const breakdownItems: BreakdownItem[] = [{
          type: BREAKDOWN_TYPE.SECONDARY_SPORT,
          memberId: member.id,
          memberName: `${member.name} ${member.second_name}`,
          concept: 'Cuota Deportiva',
          description: sport.quotes?.[0]?.name || sport.name,
          amount: Number(sportAmount),
        }];

        memberPayments.push({
          type: PAYMENT_TYPE.SECONDARY_SPORT,
          sportId: sport.id,
          sportName: sport.name,
          amount: Number(sportAmount),
          description: sport.quotes?.[0]?.name || sport.name,
          breakdown: {
            items: breakdownItems,
            total: Number(sportAmount),
          },
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
