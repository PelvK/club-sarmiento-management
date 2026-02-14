import { MemberFormData } from "../../types";
import { User } from "lucide-react";

export const PersonalInfoSection: React.FC<{
  formData: MemberFormData;
  setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>;
}> = ({ formData, setFormData }) => {
  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "dni" | "phone_number",
  ) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <User className="section-icon" />
        <h3 className="section-title">Información Personal</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="modal-form-label">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            value={formData.name || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="modal-form-input"
            required
          />
        </div>

        <div>
          <label htmlFor="second_name" className="modal-form-label">
            Apellido
          </label>
          <input
            type="text"
            id="second_name"
            value={formData.second_name || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                second_name: e.target.value,
              }))
            }
            className="modal-form-input"
            required
          />
        </div>

        <div>
          <label htmlFor="dni" className="modal-form-label">
            DNI
          </label>
          <input
            type="text"
            id="dni"
            value={formData.dni}
            onChange={(e) => handleNumericInput(e, "dni")}
            inputMode="numeric"
            pattern="[0-9]*"
            className="modal-form-input"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="modal-form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="modal-form-input"
            required
          />
        </div>

        <div>
          <label htmlFor="phone_number" className="modal-form-label">
            Teléfono
          </label>
          <input
            type="text"
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => handleNumericInput(e, "phone_number")}
            inputMode="numeric"
            pattern="[0-9]*"
            className="modal-form-input"
            required
          />
        </div>

        <div>
          <label htmlFor="birthdate" className="modal-form-label">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            id="birthdate"
            value={formData.birthdate || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                birthdate: e.target.value,
              }))
            }
            className="modal-form-input"
            required
          />
        </div>
      </div>
    </div>
  );
};
