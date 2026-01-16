export type AppButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  startIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}
