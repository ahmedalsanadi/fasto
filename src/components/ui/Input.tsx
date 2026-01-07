import * as React from 'react';

/**
 * Utility function to merge classes
 */
const cn = (...classes: (string | undefined | boolean)[]): string => {
    return classes.filter(Boolean).join(' ');
};

export type InputVariant = 'default' | 'filled' | 'outline';
export type InputSize = 'default' | 'sm' | 'md' | 'lg';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: InputVariant;
    inputSize?: InputSize;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    containerClassName?: string;
}

// Container Styles
const containerBaseStyles =
    'group flex items-center gap-2 overflow-hidden px-3 transition-all duration-200 border border-solid outline-none focus-within:ring-[3px] focus-within:ring-ring/50';

const containerVariantStyles: Record<InputVariant, string> = {
    default: 'bg-white border-[#b8c2cc] shadow-inner',
    filled: 'bg-input-background border-transparent',
    outline: 'bg-transparent border-input',
};

const containerSizeStyles: Record<InputSize, string> = {
    default: 'h-10 rounded-md',
    sm: 'h-8 rounded-sm px-2',
    md: 'h-[40px] rounded-[12px]',
    lg: 'h-[50px] rounded-[16px]',
};

// Input (Inner) Styles
const inputBaseStyles =
    'flex h-full w-full bg-transparent py-2 text-sm text-[#121212] outline-none placeholder:text-[#8795a0] disabled:cursor-not-allowed disabled:opacity-50 font-sans text-start';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            containerClassName,
            type,
            variant = 'default',
            inputSize = 'default',
            startIcon,
            endIcon,
            ...props
        },
        ref,
    ) => {
        return (
            <div
                className={cn(
                    containerBaseStyles,
                    containerVariantStyles[variant],
                    containerSizeStyles[inputSize],
                    containerClassName,
                )}
            >
                {startIcon && (
                    <div className="flex shrink-0 items-center justify-center text-muted-foreground/60">
                        {startIcon}
                    </div>
                )}
                <input
                    type={type}
                    ref={ref}
                    className={cn(inputBaseStyles, className)}
                    {...props}
                />
                {endIcon && (
                    <div className="flex shrink-0 items-center justify-center text-muted-foreground/60">
                        {endIcon}
                    </div>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';

export { Input };
