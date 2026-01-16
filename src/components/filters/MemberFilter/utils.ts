import { Member } from "../../../lib/types/member";
import { FiltersType } from "./types";

/**
 * Filters members based on the provided filters.
 *
 * @param members Array of members
 * @param filters Applied filters
 * @returns Array of filtered members
 */
export function filterMembers(members: Member[], filters: FiltersType): Member[] {
  return members.filter((member) => {
    const nameMatch = member.name
      .toLowerCase()
      .includes(filters.name.toLowerCase());

    const secondNameMatch = member.second_name
      .toLowerCase()
      .includes(filters.name.toLowerCase());

    const dniMatch = member.dni
      .toLowerCase()
      .includes(filters.dni.toLowerCase());

    const sportMatch =
      filters.sport === "All"
        ? true
        : filters.sport === "None"
        ? !member.sports || member.sports.length === 0
        : member.sports?.some((s) => s.name === filters.sport);

    return (nameMatch || secondNameMatch) && dniMatch && sportMatch;
  });
}
