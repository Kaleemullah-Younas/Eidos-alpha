'use client';

import React, { useState, useRef } from 'react';
import { X, FileDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Certificate from './Certificate';
import styles from './CertificateModal.module.css';
import ConfirmationModal from './ConfirmationModal';

interface CertificateModalProps {
    courseName: string;
    onClose: () => void;
    onSaveName: (name: string) => void;
    existingName?: string;
    date?: Date;
}

export default function CertificateModal({
    courseName,
    onClose,
    onSaveName,
    existingName,
    date = new Date()
}: CertificateModalProps) {
    const [name, setName] = useState(existingName || '');
    const [viewMode, setViewMode] = useState(!!existingName);
    const [isDownloading, setIsDownloading] = useState(false);
    const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
    const certificateRef = useRef<HTMLDivElement>(null);

    const certificateId = useRef(`EIDOS-${Date.now().toString(36).toUpperCase()}`);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSaveName(name);
            setViewMode(true);
        }
    };

    const downloadPDF = async () => {
        if (!certificateRef.current) return;

        setIsDownloading(true);

        try {
            // Wait for fonts to load
            await document.fonts.ready;

            // Small delay to ensure rendering is complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capture the certificate as canvas with higher settings
            const canvas = await html2canvas(certificateRef.current, {
                scale: 3, // Higher quality for PDF
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                // Ensure the element is fully rendered
                onclone: (clonedDoc, element) => {
                    // Force all styles to be applied
                    element.style.transform = 'none';
                    element.style.boxShadow = 'none';
                }
            });

            // Create PDF in landscape orientation
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            // Get PDF dimensions
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate aspect ratio to fit properly
            const canvasAspect = canvas.width / canvas.height;
            const pdfAspect = pdfWidth / pdfHeight;

            let imgWidth = pdfWidth;
            let imgHeight = pdfHeight;
            let offsetX = 0;
            let offsetY = 0;

            if (canvasAspect > pdfAspect) {
                // Canvas is wider - fit to width
                imgHeight = pdfWidth / canvasAspect;
                offsetY = (pdfHeight - imgHeight) / 2;
            } else {
                // Canvas is taller - fit to height
                imgWidth = pdfHeight * canvasAspect;
                offsetX = (pdfWidth - imgWidth) / 2;
            }

            // Add the image to PDF with proper sizing
            const imgData = canvas.toDataURL('image/png', 1.0);
            pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight);

            // Generate filename
            const sanitizedCourseName = courseName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            const filename = `Eidos_Certificate_${sanitizedCourseName}.pdf`;

            // Download the PDF
            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setErrorModal({
                title: 'Error',
                message: 'Failed to generate PDF. Please try the Print option instead.'
            });
        } finally {
            setIsDownloading(false);
        }
    };



    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} ${viewMode ? styles.largeModal : ''}`}>
                {/* Close button - only show in form mode, in view mode it's in actions bar */}
                {!viewMode && (
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                )}

                {!viewMode ? (
                    <div className={styles.formContainer}>
                        <div className={styles.iconWrapper}>
                            <span className={styles.trophyIcon}>🏆</span>
                        </div>
                        <h2>Course Completed!</h2>
                        <p>Congratulations on passing <strong>{courseName}</strong>.</p>
                        <p className={styles.instruction}>Enter your full name as you want it to appear on your certificate.</p>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Full Name"
                                className={styles.input}
                                autoFocus
                                required
                            />
                            <button type="submit" className={styles.generateBtn}>
                                Generate Certificate
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className={styles.certificateView}>
                        <div className={styles.actionsBar}>
                            <h3>Your Certificate</h3>
                            <div className={styles.actionButtons}>
                                <button
                                    className={styles.downloadBtn}
                                    onClick={downloadPDF}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? (
                                        <>
                                            <span className={styles.spinner}></span>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FileDown size={18} />
                                            Download PDF
                                        </>
                                    )}
                                </button>
                                <button onClick={onClose} className={styles.closeBtn}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.certificateScroll}>
                            <Certificate
                                ref={certificateRef}
                                courseName={courseName}
                                studentName={name}
                                date={date}
                                certificateId={certificateId.current}
                            />
                        </div>
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={!!errorModal}
                onClose={() => setErrorModal(null)}
                onConfirm={() => setErrorModal(null)}
                title={errorModal?.title || ''}
                message={errorModal?.message || ''}
                confirmText="OK"
                cancelText=""
                isDanger={true}
            />
        </div>
    );
}
