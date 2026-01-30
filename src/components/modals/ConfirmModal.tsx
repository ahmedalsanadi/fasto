'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    variant?: 'danger' | 'default';
    isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant = 'default',
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const isDanger = variant === 'danger';

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-desc">
                <div
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}>
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <h2
                                id="confirm-modal-title"
                                className="text-lg font-bold text-gray-900">
                                {title}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label={cancelLabel}>
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p
                            id="confirm-modal-desc"
                            className="mt-3 text-gray-600 text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 p-4 border-t border-gray-100 bg-gray-50/50">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50">
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={cn(
                                'flex-1 px-4 py-2.5 font-semibold rounded-xl transition-colors disabled:opacity-50',
                                isDanger
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-theme-primary text-white hover:brightness-95',
                            )}>
                            {isLoading ? '...' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmModal;
