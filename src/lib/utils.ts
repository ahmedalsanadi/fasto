import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Validates if a string is a valid CSS color.
 */
export function isValidColor(color: string): boolean {
    return (
        /^#([A-Fa-f0-9]{3}){1,2}$/.test(color) ||
        /^rgba?\((\d{1,3}%?,\s?){2,3}\d{1,3}%?\)$/.test(color) ||
        /^[a-z]+$/.test(color)
    );
}
