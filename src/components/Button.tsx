import type { ReactNode } from "react";

interface ButtonProps {
  onClick: () => void;
  variant?: "primary" | "secondary";
  children: ReactNode;
}

function Button({ onClick, variant = "primary", children }: ButtonProps) {
  const base = "flex items-center gap-1.5 text-sm font-medium rounded-md px-3 h-9 transition-colors";
  const styles = {
    primary: "text-white bg-(--color-primary) hover:opacity-90 active:opacity-80 transition-opacity",
    secondary: "text-(--color-primary) border border-(--color-primary) bg-white hover:bg-(--color-primary) hover:text-white",
  };

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}

export default Button;
