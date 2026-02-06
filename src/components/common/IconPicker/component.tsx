import React, { useMemo, useState } from "react";
import { icons, LucideIcon } from "lucide-react";
import "./styles.css";

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
  maxIcons?: number;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  placeholder = "Buscar icono… (bike, swim, ball)",
  maxIcons = 200,
}) => {
  const [search, setSearch] = useState("");

  const iconNames = useMemo(
    () => Object.keys(icons),
    []
  );

  const filteredIcons = useMemo(() => {
    return iconNames
      .filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, maxIcons);
  }, [iconNames, search, maxIcons]);

  return (
    <div className="icon-picker">
      <input
        type="text"
        className="icon-picker-search"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="icon-picker-grid">
        {filteredIcons.map((name) => {
          const Icon = icons[name as keyof typeof icons] as LucideIcon;
          const selected = value === name;

          return (
            <button
              key={name}
              type="button"
              className={`icon-picker-item ${
                selected ? "selected" : ""
              }`}
              onClick={() => onChange(name)}
              title={name}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
