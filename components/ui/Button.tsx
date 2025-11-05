import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text' | 'icon';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 shadow-sm hover:shadow-md';
  
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-500 shadow-sm hover:shadow-md',
    secondary: 'bg-zinc-700 text-white hover:bg-zinc-600 focus:ring-zinc-500',
    outline: 'border-2 border-zinc-300 text-zinc-900 hover:bg-zinc-50 focus:ring-zinc-500 bg-transparent hover:text-zinc-900 hover:border-zinc-400',
    ghost: 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 focus:ring-zinc-500 shadow-none hover:shadow-none',
    text: 'text-zinc-600 hover:text-zinc-900 font-medium shadow-none hover:shadow-none focus:ring-0 hover:bg-transparent active:scale-100',
    icon: 'p-1 hover:bg-zinc-200 rounded-lg transition-colors shadow-none hover:shadow-none focus:ring-0 active:scale-100',
  };
  
  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
