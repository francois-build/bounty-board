import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  primary?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, primary = false, ...props }) => {
  const baseClasses = "px-8 py-3 rounded-md shadow-lg active:scale-98 text-lg font-semibold";
  const primaryClasses = "bg-slate-900 text-white";
  const secondaryClasses = "bg-white text-slate-900";

  return (
    <button className={`${baseClasses} ${primary ? primaryClasses : secondaryClasses}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
