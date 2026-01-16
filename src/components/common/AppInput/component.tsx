import React from 'react';
import './styles.css';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => (
  <div className="input-wrapper">
    {label && <label className="input-label">{label}</label>}
    <input className={`input-field ${error ? 'input-error' : ''}`} {...props} />
    {error && <span className="input-error-message">{error}</span>}
  </div>
);
