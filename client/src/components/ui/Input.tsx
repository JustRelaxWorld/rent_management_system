import React from 'react';

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
  inputSize?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', inputSize = 'md', leftIcon, rightIcon, ...props }, ref) => {
    const baseClasses = 'flex w-full rounded-xl border bg-white px-4 font-medium transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    
    const variantClasses = {
      default: 'border-accent-300 focus-visible:ring-primary-500 focus-visible:border-primary-500',
      error: 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
      success: 'border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500',
    };
    
    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-12 text-base',
      lg: 'h-14 text-lg',
    };

    const paddingClasses = leftIcon ? 'pl-12' : 'pl-4';
    const paddingRightClasses = rightIcon ? 'pr-12' : 'pr-4';

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-400">
            {leftIcon}
          </div>
        )}
        <input
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[inputSize],
            paddingClasses,
            paddingRightClasses,
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 