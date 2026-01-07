'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

// Utility function to merge classes
const cn = (...classes: (string | undefined | boolean)[]): string => {
    return classes.filter(Boolean).join(' ');
};

// Dropdown Context for state management
interface DropdownContextType {
    open: boolean;
    setOpen: (open: boolean) => void;
    triggerRef: React.RefObject<HTMLElement | null> | null;
    contentRef: React.RefObject<HTMLDivElement | null> | null;
}

const DropdownContext = React.createContext<DropdownContextType>({
    open: false,
    setOpen: () => {},
    triggerRef: null,
    contentRef: null,
});

// Main Dropdown Component
interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const DropdownMenu = ({
    children,
    open: controlledOpen,
    onOpenChange,
    ...props
}: DropdownMenuProps) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const triggerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = useCallback(
        (newOpen: boolean) => {
            if (isControlled) {
                onOpenChange?.(newOpen);
            } else {
                setUncontrolledOpen(newOpen);
            }
            onOpenChange?.(newOpen);
        },
        [isControlled, onOpenChange],
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                open &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node) &&
                contentRef.current &&
                !contentRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [open, setOpen]);

    // Close dropdown when pressing Escape
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open) {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, setOpen]);

    return (
        <DropdownContext.Provider
            value={{ open, setOpen, triggerRef, contentRef }}>
            <div className="relative inline-block" {...props}>
                {children}
            </div>
        </DropdownContext.Provider>
    );
};

// Dropdown Trigger Component
interface DropdownMenuTriggerProps extends React.HTMLAttributes<HTMLElement> {
    asChild?: boolean;
    children: React.ReactNode;
}

const DropdownMenuTrigger = ({
    asChild = false,
    children,
    ...props
}: DropdownMenuTriggerProps) => {
    const { open, setOpen, triggerRef } = React.useContext(DropdownContext);
    const childRefStore = useRef<React.Ref<HTMLElement> | undefined>(undefined);

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setOpen(!open);
    };

    // Create a stable ref callback that will be used by cloneElement
    // This avoids React's detection of ref access during render
    const mergedRefCallback = useCallback(
        (node: HTMLElement | null) => {
            // Set our triggerRef
            if (triggerRef) {
                (
                    triggerRef as React.MutableRefObject<HTMLElement | null>
                ).current = node;
            }
            // Call the stored child ref if it exists and is a function
            const storedRef = childRefStore.current;
            if (typeof storedRef === 'function') {
                storedRef(node);
            }
        },
        [triggerRef],
    );

    if (asChild && React.isValidElement(children)) {
        const child = children as React.ReactElement<
            React.HTMLAttributes<HTMLElement>
        >;
        // Store the child's ref for later use (this happens during render but is safe)
        childRefStore.current = (child as { ref?: React.Ref<HTMLElement> }).ref;

        return React.cloneElement(child, {
            ref: mergedRefCallback,
            onClick: (e: React.MouseEvent<HTMLElement>) => {
                child.props.onClick?.(e);
                handleClick(e);
            },
            'aria-expanded': open,
            'data-state': open ? 'open' : 'closed',
            ...props,
        } as React.HTMLAttributes<HTMLElement>);
    }

    return (
        <button
            ref={triggerRef as React.RefObject<HTMLButtonElement | null>}
            onClick={handleClick}
            aria-expanded={open}
            data-state={open ? 'open' : 'closed'}
            className="outline-none focus:outline-none"
            {...props}>
            {children}
        </button>
    );
};

// Dropdown Content Component
interface DropdownMenuContentProps
    extends React.HTMLAttributes<HTMLDivElement> {
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
}

const DropdownMenuContent = React.forwardRef<
    HTMLDivElement,
    DropdownMenuContentProps
>(
    (
        {
            className,
            sideOffset = 4,
            align = 'start',
            side = 'bottom',
            children,
            ...props
        },
        ref,
    ) => {
        const { open, setOpen, triggerRef, contentRef } =
            React.useContext(DropdownContext);
        const [position, setPosition] = useState({ top: 0, left: 0 });
        const internalRef = useRef<HTMLDivElement>(null);

        // Combine refs
        const combinedRef = useCallback(
            (node: HTMLDivElement) => {
                internalRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    (
                        ref as React.MutableRefObject<HTMLDivElement | null>
                    ).current = node;
                }
                if (contentRef) {
                    (
                        contentRef as React.MutableRefObject<HTMLDivElement | null>
                    ).current = node;
                }
            },
            [ref, contentRef],
        );

        // Position the dropdown
        useEffect(() => {
            if (open && triggerRef?.current && internalRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const contentRect = internalRef.current.getBoundingClientRect();

                let top = 0;
                let left = 0;

                switch (side) {
                    case 'top':
                        top = triggerRect.top - contentRect.height - sideOffset;
                        break;
                    case 'bottom':
                    default:
                        top = triggerRect.bottom + sideOffset;
                        break;
                    case 'left':
                        left =
                            triggerRect.left - contentRect.width - sideOffset;
                        top = triggerRect.top;
                        break;
                    case 'right':
                        left = triggerRect.right + sideOffset;
                        top = triggerRect.top;
                        break;
                }

                switch (align) {
                    case 'center':
                        left =
                            triggerRect.left +
                            (triggerRect.width - contentRect.width) / 2;
                        break;
                    case 'end':
                        left = triggerRect.right - contentRect.width;
                        break;
                    case 'start':
                    default:
                        left = triggerRect.left;
                        break;
                }

                // Ensure dropdown stays within viewport
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                if (left + contentRect.width > viewportWidth) {
                    left = viewportWidth - contentRect.width - 8;
                }
                if (left < 0) {
                    left = 8;
                }
                if (top + contentRect.height > viewportHeight) {
                    top = viewportHeight - contentRect.height - 8;
                }
                if (top < 0) {
                    top = 8;
                }

                setPosition({ top, left });
            }
        }, [open, side, align, sideOffset, triggerRef]);

        if (!open) return null;

        return (
            <div
                ref={combinedRef}
                data-slot="dropdown-menu-content"
                data-state={open ? 'open' : 'closed'}
                style={{
                    position: 'fixed',
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    zIndex: 100,
                }}
                className={cn(
                    'bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95',
                    side === 'bottom' && 'slide-in-from-top-2',
                    side === 'top' && 'slide-in-from-bottom-2',
                    side === 'left' && 'slide-in-from-right-2',
                    side === 'right' && 'slide-in-from-left-2',
                    'min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md',
                    className,
                )}
                onClick={(e) => e.stopPropagation()}
                {...props}>
                {children}
            </div>
        );
    },
);

DropdownMenuContent.displayName = 'DropdownMenuContent';

// Dropdown Group Component
const DropdownMenuGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="dropdown-menu-group"
        className={cn('p-1', className)}
        {...props}
    />
));

DropdownMenuGroup.displayName = 'DropdownMenuGroup';

// Dropdown Item Component
interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
    inset?: boolean;
    variant?: 'default' | 'destructive';
    disabled?: boolean;
}

const DropdownMenuItem = React.forwardRef<
    HTMLDivElement,
    DropdownMenuItemProps
>(
    (
        { className, inset, variant = 'default', disabled, children, ...props },
        ref,
    ) => {
        const { setOpen } = React.useContext(DropdownContext);

        const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (disabled) return;
            props.onClick?.(e);
            setOpen(false);
        };

        return (
            <div
                ref={ref}
                data-slot="dropdown-menu-item"
                data-inset={inset}
                data-variant={variant}
                data-disabled={disabled}
                onClick={handleClick}
                className={cn(
                    'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none',
                    'focus:bg-accent focus:text-accent-foreground',
                    variant === 'destructive' &&
                        'text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 focus:text-destructive',
                    inset && 'pl-8',
                    disabled && 'pointer-events-none opacity-50',
                    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4',
                    '[&_svg:not([class*="text-"])]:text-muted-foreground',
                    variant === 'destructive' && '[&_svg]:text-destructive!',
                    className,
                )}
                {...props}>
                {children}
            </div>
        );
    },
);

DropdownMenuItem.displayName = 'DropdownMenuItem';

// Dropdown Checkbox Item Component
interface DropdownMenuCheckboxItemProps
    extends React.HTMLAttributes<HTMLDivElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
}

const DropdownMenuCheckboxItem = React.forwardRef<
    HTMLDivElement,
    DropdownMenuCheckboxItemProps
>(
    (
        { className, checked, onCheckedChange, disabled, children, ...props },
        ref,
    ) => {
        const { setOpen } = React.useContext(DropdownContext);

        const handleClick = () => {
            if (disabled) return;
            onCheckedChange?.(!checked);
        };

        return (
            <div
                ref={ref}
                data-slot="dropdown-menu-checkbox-item"
                data-checked={checked}
                data-disabled={disabled}
                onClick={handleClick}
                className={cn(
                    'relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none',
                    'focus:bg-accent focus:text-accent-foreground',
                    disabled && 'pointer-events-none opacity-50',
                    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4',
                    className,
                )}
                {...props}>
                <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                    {checked && <CheckIcon className="size-4" />}
                </span>
                {children}
            </div>
        );
    },
);

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

// Dropdown Radio Group Component
const DropdownMenuRadioGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="dropdown-menu-radio-group"
        className={cn('p-1', className)}
        {...props}
    />
));

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';

// Dropdown Radio Item Component
interface DropdownMenuRadioItemProps
    extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
}

const DropdownMenuRadioItem = React.forwardRef<
    HTMLDivElement,
    DropdownMenuRadioItemProps
>(
    (
        {
            className,
            value,
            checked,
            onCheckedChange,
            disabled,
            children,
            ...props
        },
        ref,
    ) => {
        const { setOpen } = React.useContext(DropdownContext);

        const handleClick = () => {
            if (disabled) return;
            onCheckedChange?.(!checked);
        };

        return (
            <div
                ref={ref}
                data-slot="dropdown-menu-radio-item"
                data-checked={checked}
                data-disabled={disabled}
                onClick={handleClick}
                className={cn(
                    'relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none',
                    'focus:bg-accent focus:text-accent-foreground',
                    disabled && 'pointer-events-none opacity-50',
                    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4',
                    className,
                )}
                {...props}>
                <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                    {checked && <CircleIcon className="size-2 fill-current" />}
                </span>
                {children}
            </div>
        );
    },
);

DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

// Dropdown Label Component
interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
    inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<
    HTMLDivElement,
    DropdownMenuLabelProps
>(({ className, inset, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="dropdown-menu-label"
        data-inset={inset}
        className={cn(
            'px-2 py-1.5 text-sm font-semibold',
            inset && 'pl-8',
            className,
        )}
        {...props}
    />
));

DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// Dropdown Separator Component
const DropdownMenuSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="dropdown-menu-separator"
        className={cn('-mx-1 my-1 h-px bg-border', className)}
        {...props}
    />
));

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// Dropdown Shortcut Component
const DropdownMenuShortcut = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        data-slot="dropdown-menu-shortcut"
        className={cn(
            'ml-auto text-xs tracking-widest text-muted-foreground',
            className,
        )}
        {...props}
    />
));

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

// Dropdown Sub Component
interface DropdownMenuSubProps {
    children: React.ReactNode;
}

const DropdownMenuSub = ({ children }: DropdownMenuSubProps) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative">
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    if (child.type === DropdownMenuSubTrigger) {
                        return React.cloneElement(child, {
                            ref: triggerRef,
                            onClick: () => setOpen(!open),
                            'data-state': open ? 'open' : 'closed',
                        } as React.HTMLAttributes<HTMLElement>);
                    }
                    if (child.type === DropdownMenuSubContent) {
                        return React.cloneElement(child, {
                            ref: contentRef,
                            open,
                            triggerRef,
                            onOpenChange: setOpen,
                        } as React.HTMLAttributes<HTMLDivElement>);
                    }
                }
                return child;
            })}
        </div>
    );
};

// Dropdown Sub Trigger Component
interface DropdownMenuSubTriggerProps
    extends React.HTMLAttributes<HTMLDivElement> {
    inset?: boolean;
    children: React.ReactNode;
}

const DropdownMenuSubTrigger = React.forwardRef<
    HTMLDivElement,
    DropdownMenuSubTriggerProps
>(({ className, inset, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-slot="dropdown-menu-sub-trigger"
            data-inset={inset}
            className={cn(
                'flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none',
                'focus:bg-accent focus:text-accent-foreground',
                'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
                inset && 'pl-8',
                '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4',
                '[&_svg:not([class*="text-"])]:text-muted-foreground',
                className,
            )}
            {...props}>
            {children}
            <ChevronRightIcon className="ml-auto size-4" />
        </div>
    );
});

DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

// Dropdown Sub Content Component
interface DropdownMenuSubContentProps
    extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    triggerRef?: React.RefObject<HTMLElement | null>;
    onOpenChange?: (open: boolean) => void;
}

const DropdownMenuSubContent = React.forwardRef<
    HTMLDivElement,
    DropdownMenuSubContentProps
>(({ className, open, triggerRef, onOpenChange, children, ...props }, ref) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const contentRef = useRef<HTMLDivElement>(null);

    const combinedRef = useCallback(
        (node: HTMLDivElement) => {
            contentRef.current = node;
            if (typeof ref === 'function') {
                ref(node);
            } else if (ref) {
                (ref as React.MutableRefObject<HTMLDivElement | null>).current =
                    node;
            }
        },
        [ref],
    );

    useEffect(() => {
        if (open && triggerRef?.current && contentRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const contentRect = contentRef.current.getBoundingClientRect();

            let top = triggerRect.top;
            let left = triggerRect.right + 4;

            // Adjust if it would overflow the viewport
            if (left + contentRect.width > window.innerWidth) {
                left = triggerRect.left - contentRect.width - 4;
            }

            setPosition({ top, left });
        }
    }, [open, triggerRef]);

    if (!open) return null;

    return (
        <div
            ref={combinedRef}
            data-slot="dropdown-menu-sub-content"
            style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 100,
            }}
            className={cn(
                'bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 slide-in-from-left-1',
                'min-w-32 overflow-hidden rounded-md border p-1 shadow-lg',
                className,
            )}
            onClick={(e) => e.stopPropagation()}
            {...props}>
            {children}
        </div>
    );
});

DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
};
