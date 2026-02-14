import { Search, Users, Crown, UserCheck, UserX } from "lucide-react";
import { Member } from "../../../../../lib/types/member";
import { MemberFormData } from "../../types";
import { FAMILY_STATUS } from "../../../../../lib/enums/SportSelection";
import "./styles.css";

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
    <div className="section-card">
      <div className="section-header">
        <Users className="section-icon" />
        <h3 className="section-title">Grupo Familiar</h3>
      </div>

      <div className="family-cards-container">
        <div
          className={`family-card ${
            formData.familyGroupStatus === FAMILY_STATUS.HEAD ? "selected" : ""
          }`}
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              familyGroupStatus: FAMILY_STATUS.HEAD,
            }));
            setSelectedFamilyHead(null);
          }}
        >
          <input
            type="radio"
            checked={formData.familyGroupStatus === FAMILY_STATUS.HEAD}
            onChange={() => {}}
            className="family-card-radio"
            name="familyRole"
          />
          <Crown className="family-card-icon" />
          <span className="family-card-label">Jefe de Familia</span>
        </div>

        <div
          className={`family-card ${
            formData.familyGroupStatus === FAMILY_STATUS.MEMBER
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              familyGroupStatus: FAMILY_STATUS.MEMBER,
            }))
          }
        >
          <input
            type="radio"
            checked={formData.familyGroupStatus === FAMILY_STATUS.MEMBER}
            onChange={() => {}}
            className="family-card-radio"
            name="familyRole"
          />
          <UserCheck className="family-card-icon" />
          <span className="family-card-label">Miembro de Familia</span>
        </div>

        <div
          className={`family-card ${
            formData.familyGroupStatus === FAMILY_STATUS.NONE ? "selected" : ""
          }`}
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              familyGroupStatus: FAMILY_STATUS.NONE,
            }));
            setSelectedFamilyHead(null);
          }}
        >
          <input
            type="radio"
            checked={formData.familyGroupStatus === FAMILY_STATUS.NONE}
            onChange={() => {}}
            className="family-card-radio"
            name="familyRole"
          />
          <UserX className="family-card-icon" />
          <span className="family-card-label">Ninguno</span>
        </div>
      </div>

      {formData.familyGroupStatus === FAMILY_STATUS.MEMBER && (
        <div className="family-head-selector">
          <label className="family-head-label">Jefe de Familia</label>
          <div className="family-head-input-container">
            <div className="family-head-display">
              {selectedFamilyHead ? (
                <div>
                  <div className="family-head-name">
                    {selectedFamilyHead.name}
                  </div>
                  <div className="family-head-dni">
                    DNI: {selectedFamilyHead.dni}
                  </div>
                </div>
              ) : (
                <span className="family-head-placeholder">
                  Ningún jefe de familia seleccionado
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFamilyHeadSearch(true)}
              className="family-head-search-button"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
