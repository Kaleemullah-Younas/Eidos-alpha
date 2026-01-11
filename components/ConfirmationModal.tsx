import React from 'react';
import { X, Loader2 } from 'lucide-react';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    isDanger?: boolean; // If true, button will be red (for delete actions)
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    isDanger = false,
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose} disabled={isLoading}>
                        <X size={18} />
                    </button>
                </div>
                <div className={styles.modalContent}>
                    <p>{message}</p>
                </div>
                <div className={styles.modalActions}>
                    {cancelText && (
                        <button className={styles.cancelBtn} onClick={onClose} disabled={isLoading}>
                            {cancelText}
                        </button>
                    )}
                    <button
                        className={`${styles.confirmBtn} ${isDanger ? styles.danger : ''}`}
                        onClick={onConfirm}
                        style={!cancelText ? { width: '100%', justifyContent: 'center' } : {}}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 size={16} className={styles.spinner} />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
