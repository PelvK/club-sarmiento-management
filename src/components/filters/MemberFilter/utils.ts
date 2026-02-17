import { Member } from "../../../lib/types/member";
import { FiltersType } from "./types";

/**
 * Filters members based on the provided filters.
 * Handles edge cases like empty arrays, undefined values, and null properties.
 *
 * @param members Array of members (can be empty or undefined)
 * @param filters Applied filters
 * @returns Array of filtered members (never returns undefined)
 */
export function filterMembers(
  members: Member[] | undefined | null,
  filters: FiltersType
): Member[] {
  if (!members || !Array.isArray(members) || members.length === 0) {
    return [];
  }

  return members.filter((member) => {
    if (!member) return false;

    const memberName = (member.name || "").toLowerCase();
    const memberSecondName = (member.second_name || "").toLowerCase();
    const filterName = (filters.name || "").toLowerCase();

    const nameMatch = memberName.includes(filterName);
    const secondNameMatch = memberSecondName.includes(filterName);

    const memberDni = (member.dni || "").toLowerCase();
    const filterDni = (filters.dni || "").toLowerCase();
    const dniMatch = memberDni.includes(filterDni);

    let sportMatch = false;
    
    if (!filters.sport || filters.sport === "All") {
      sportMatch = true;
    } else if (filters.sport === "None") {
      sportMatch = !member.sports || member.sports.length === 0;
    } else {
      if (member.sports && Array.isArray(member.sports) && member.sports.length > 0) {
        sportMatch = member.sports.some(
          (sport) => sport && sport.name === filters.sport
        );
      } else {
        sportMatch = false;
      }
    }

    return (nameMatch || secondNameMatch) && dniMatch && sportMatch;
  });
}