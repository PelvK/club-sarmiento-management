import { MemberFormData } from "../../types";

export const PersonalInfoSection: React.FC<{
  formData: MemberFormData;
  setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>;
}> = ({ formData, setFormData }) => {
  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'dni' | 'phone_number'
  ) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nombre
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label
          htmlFor="second_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Apellido
        </label>
        <input
          type="text"
          id="second_name"
          value={formData.second_name}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              second_name: e.target.value,
            }))
          }
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label
          htmlFor="dni"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          DNI
        </label>
        <input
          type="text"
          id="dni"
          value={formData.dni}
          onChange={(e) => handleNumericInput(e, 'dni')}
          inputMode="numeric"
          pattern="[0-9]*"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label
          htmlFor="phone_number"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Teléfono
        </label>
        <input
          type="text"
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => handleNumericInput(e, 'phone_number')}
          inputMode="numeric"
          pattern="[0-9]*"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          required
        />
      </div>

      <div>
        <label
          htmlFor="birthdate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Fecha de Nacimiento
        </label>
        <input
          type="date"
          id="birthdate"
          value={formData.birthdate}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              birthdate: e.target.value,
            }))
          }
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
          required
        />
      </div>
    </div>
  );
};
