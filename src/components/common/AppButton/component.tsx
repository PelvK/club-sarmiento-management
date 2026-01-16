import React from "react";
import "./styles.css";
import { AppButtonProps } from "./types";

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  startIcon,
  className = "",
  disabled = false,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`app-button ${variant === "primary" ? "app-button-primary" : "app-button-secondary"} ${className} ${disabled ? 'app-button-disabled' : ''}`}
      disabled={disabled}
      {...props}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {label}
    </button>
  );
};
/* 👈 centra verticalmente */