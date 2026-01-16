import { Search, Users } from "lucide-react";
import { Member } from "../../../../../lib/types/member";
import { MemberFormData } from "../../types";
import { FAMILY_STATUS } from "../../../../../lib/enums/SportSelection";

export const FamilyGroupSection: React.FC<{
  formData: MemberFormData;
  setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>;
  setShowFamilyHeadSearch: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedFamilyHead: React.Dispatch<React.SetStateAction<Member | null>>;
  selectedFamilyHead: Member | null;
}> = ({
  formData,
  setFormData,
  setShowFamilyHeadSearch,
  selectedFamilyHead,
  setSelectedFamilyHead,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Users className="h-5 w-5 text-[#FFD700] mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Grupo Familiar</h3>
      </div>

      <div className="flex items-center space-x-4">
        <label className="inline-flex items-center">
          <input
            type="radio"
            checked={formData.familyGroupStatus == FAMILY_STATUS.HEAD}
            onChange={() => {
              setFormData((prev) => ({
                ...prev,
                familyGroupStatus: FAMILY_STATUS.HEAD,
              }));
              setSelectedFamilyHead(null);
            }}
            className="form-radio text-[#FFD700] focus:ring-[#FFD700]"
            name="familyRole"
          />
          <span className="ml-2">Jefe de Familia</span>
        </label>

        <label className="inline-flex items-center">
          <input
            type="radio"
            checked={formData.familyGroupStatus == FAMILY_STATUS.MEMBER}
            onChange={() =>
              setFormData((prev) => ({
                ...prev,
                familyGroupStatus: FAMILY_STATUS.MEMBER,
              }))
            }
            className="form-radio text-[#FFD700] focus:ring-[#FFD700]"
            name="familyRole"
          />
          <span className="ml-2">Miembro de Familia</span>
        </label>

        <label className="inline-flex items-center">
          <input
            type="radio"
            checked={formData.familyGroupStatus == FAMILY_STATUS.NONE}
            onChange={() => {
              setFormData((prev) => ({
                ...prev,
                familyGroupStatus: FAMILY_STATUS.NONE,
              }));
              setSelectedFamilyHead(null);
            }}
            className="form-radio text-[#FFD700] focus:ring-[#FFD700]"
            name="familyRole"
          />
          <span className="ml-2">Ninguno</span>
        </label>
      </div>

      {formData.familyGroupStatus == FAMILY_STATUS.MEMBER && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jefe de Familia
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-2 border rounded-md bg-gray-50">
              {selectedFamilyHead ? (
                <div>
                  <div className="font-medium">{selectedFamilyHead.name}</div>
                  <div className="text-sm text-gray-500">
                    DNI: {selectedFamilyHead.dni}
                  </div>
                </div>
              ) : (
                <span className="text-gray-500">
                  Ningún jefe de familia seleccionado
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFamilyHeadSearch(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700]"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};