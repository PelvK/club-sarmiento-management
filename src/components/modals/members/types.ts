import { FAMILY_STATUS } from "../../../lib/enums/SportSelection";
import { Member, Quote, SportSelection } from "../../../lib/types";

export interface MemberFormData {
  id?: number;
  name?: string;
  second_name?: string;
  email?: string;
  phone_number?: string;
  sports_submit?: SportSelection[],
  dni?: string;
  address?: string;
  birthdate?: string;
  familyGroupStatus?: FAMILY_STATUS;
  societary_cuote?: Quote | null,
  familyHeadId?: number;
}

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<MemberFormData, "id">) => Promise<void>;
}

export interface EditMemberModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => Promise<void>;
}
