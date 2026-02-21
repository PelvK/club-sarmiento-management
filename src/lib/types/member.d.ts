import { FAMILY_STATUS } from "@src/lib/enums/SportSelection";
import type { Sport, SportSelection } from "./sport";
import { Quote } from "./quote";

export type Member = {
  id: number,
  dni: string,
  name: string,
  second_name: string,
  birthdate: string,
  active?: boolean,
  phone_number?: string,
  email?: string,
  address?: string,
  sports?: Sport[],
  sports_submit?: SportSelection[],
  societary_cuote?: Quote,
  familyGroupStatus?: FAMILY_STATUS
  familyHeadId?: number,
}