'use client';

import React, { forwardRef, useMemo } from 'react';
import styles from './Certificate.module.css';

interface CertificateProps {
  courseName: string;
  studentName: string;
  date: Date;
  certificateId?: string;
}

// Realistic handwritten signature SVGs
const Signature1 = () => (
  <svg viewBox="0 0 200 50" className={styles.signatureSvg}>
    {/* Main signature stroke - flowing cursive */}
    <path
      d="M8 38 C12 28, 18 22, 28 25 C38 28, 32 38, 42 32 C52 26, 48 18, 58 22 C68 26, 62 35, 75 28 C88 21, 82 32, 95 25 C108 18, 102 30, 115 24 C128 18, 135 28, 145 22 C155 16, 162 26, 172 20 L178 18"
      fill="none"
      stroke="#1a365d"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Underline flourish */}
    <path
      d="M45 42 C65 40, 95 38, 130 41"
      fill="none"
      stroke="#1a365d"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const Signature2 = () => (
  <svg viewBox="0 0 200 50" className={styles.signatureSvg}>
    {/* Complex flowing signature */}
    <path
      d="M12 32 C18 18, 28 12, 38 20 S48 35, 55 25 C62 15, 68 28, 78 18 C88 8, 95 25, 105 15 C115 5, 125 22, 135 12 C145 2, 155 18, 165 10 C172 5, 178 12, 185 8"
      fill="none"
      stroke="#1a365d"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Loop detail */}
    <path
      d="M25 35 C30 42, 40 42, 45 35"
      fill="none"
      stroke="#1a365d"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Dot */}
    <circle cx="95" cy="38" r="1.5" fill="#1a365d" />
  </svg>
);

const Signature3 = () => (
  <svg viewBox="0 0 200 50" className={styles.signatureSvg}>
    {/* Elegant looping signature */}
    <path
      d="M15 30 Q22 15, 35 25 T55 20 Q65 15, 75 28 T95 22 Q108 18, 118 30 T138 24 Q150 20, 160 32 T180 26"
      fill="none"
      stroke="#1a365d"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Decorative tail */}
    <path
      d="M175 28 C180 32, 188 28, 192 22"
      fill="none"
      stroke="#1a365d"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    {/* Small flourish */}
    <path
      d="M60 40 Q75 38, 90 41"
      fill="none"
      stroke="#1a365d"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const Signature4 = () => (
  <svg viewBox="0 0 200 50" className={styles.signatureSvg}>
    {/* Bold confident signature */}
    <path
      d="M10 28 C20 40, 30 15, 45 28 C60 41, 55 12, 72 25 C89 38, 85 10, 102 22 C119 34, 115 8, 132 20 C149 32, 145 12, 162 22 C172 28, 178 18, 188 15"
      fill="none"
      stroke="#1a365d"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Cross stroke */}
    <path
      d="M30 35 L50 38"
      fill="none"
      stroke="#1a365d"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const signatures = [Signature1, Signature2, Signature3, Signature4];

const Certificate = forwardRef<HTMLDivElement, CertificateProps>(
  ({ courseName, studentName, date, certificateId }, ref) => {
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const certId =
      certificateId || `EIDOS-${Date.now().toString(36).toUpperCase()}`;

    // Generate consistent random signatures based on certificate ID
    const [InstructorSig, AuthoritySig] = useMemo(() => {
      const hash = certId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const sig1Idx = hash % signatures.length;
      const sig2Idx = (hash + 2) % signatures.length;
      return [signatures[sig1Idx], signatures[sig2Idx]];
    }, [certId]);

    return (
      <div className={styles.certificateWrapper} ref={ref}>
        {/* Background Pattern */}
        <div className={styles.backgroundPattern}></div>

        {/* Corner Ornaments */}
        <div className={`${styles.cornerOrnament} ${styles.topLeft}`}></div>
        <div className={`${styles.cornerOrnament} ${styles.topRight}`}></div>
        <div className={`${styles.cornerOrnament} ${styles.bottomLeft}`}></div>
        <div className={`${styles.cornerOrnament} ${styles.bottomRight}`}></div>

        <div className={styles.certificateBorder}>
          <div className={styles.certificateContent}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.logoSection}>
                <div className={styles.logo}>
                  <span className={styles.logoIcon}>
                    <svg width="28" height="34" viewBox="0 0 40 48" fill="none">
                      <path d="M19.6007 4.95239C16.134 4.95239 13.334 7.71836 13.334 11.1429C13.334 14.5411 16.134 17.307 19.574 17.3333C18.7206 17.307 18.054 16.6221 18.054 15.7791C18.054 14.9362 18.7473 14.225 19.6273 14.225C23.3606 14.225 31.654 14.2249 35.3073 14.2249C37.894 14.2249 40.0007 12.1439 40.0007 9.5887C40.0007 7.03344 37.894 4.95239 35.3073 4.95239L19.6007 4.95239Z" fill="#19B8AB"/>
                      <path d="M11.9815 17.3333C8.51484 17.3333 5.71484 20.0992 5.71484 23.5237C5.71484 26.9219 8.51484 29.6878 11.9548 29.7142C11.1015 29.6878 10.4348 29.003 10.4348 28.16C10.4348 27.317 11.1282 26.6058 12.0082 26.6058C15.7415 26.6058 24.0349 26.6058 27.6882 26.6058C30.2748 26.6058 32.3815 24.5248 32.3815 21.9696C32.3815 19.4143 30.2748 17.3333 27.6882 17.3333L11.9815 17.3333Z" fill="#21BAC8"/>
                      <path d="M6.71429 29.7144C3 29.7144 -1.08238e-07 32.6931 0 36.381C1.07406e-07 40.0406 3 43.0193 6.68569 43.0477C5.77142 43.0193 5.05714 42.2818 5.05714 41.3739C5.05714 40.4661 5.80002 39.7002 6.74288 39.7002C10.7428 39.7002 19.6286 39.7002 23.5429 39.7002C26.3143 39.7002 28.5714 37.4591 28.5714 34.7073C28.5714 31.9555 26.3143 29.7144 23.5429 29.7144L6.71429 29.7144Z" fill="#23D4D4"/>
                    </svg>
                  </span>
                  <span className={styles.logoText}>EIDOS</span>
                </div>
                <p className={styles.tagline}>AI-Powered Learning Platform</p>
              </div>
              <h1 className={styles.title}>Certificate of Completion</h1>
              <div className={styles.divider}>
                <span className={styles.dividerLine}></span>
                <span className={styles.dividerIcon}>★</span>
                <span className={styles.dividerLine}></span>
              </div>
            </div>

            {/* Body */}
            <div className={styles.body}>
              <p className={styles.preText}>This is to certify that</p>

              <h2 className={styles.studentName}>{studentName}</h2>

              <p className={styles.middleText}>
                has successfully completed the course
              </p>

              <h3 className={styles.courseName}>{courseName}</h3>

              <p className={styles.dateText}>Issued on {formattedDate}</p>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <div className={styles.signatureSection}>
                <div className={styles.signature}>
                  <div className={styles.signatureGraphic}>
                    <InstructorSig />
                  </div>
                  <div className={styles.signatureLine}></div>
                  <p className={styles.signatureName}>Eidos AI</p>
                  <p className={styles.signatureTitle}>Course Instructor</p>
                </div>
              </div>

              <div className={styles.sealSection}>
                <div className={styles.seal}>
                  <div className={styles.sealInner}>
                    <div className={styles.sealRing}></div>
                    <div className={styles.sealCore}>
                      <span className={styles.sealIcon}>✓</span>
                      <span className={styles.sealText}>VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.signatureSection}>
                <div className={styles.signature}>
                  <div className={styles.signatureGraphic}>
                    <AuthoritySig />
                  </div>
                  <div className={styles.signatureLine}></div>
                  <p className={styles.signatureName}>Certificate Authority</p>
                  <p className={styles.signatureTitle}>Eidos Platform</p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className={styles.bottomBar}>
              <p className={styles.certId}>Certificate ID: {certId}</p>
              <p className={styles.createdBy}>
                This course was created by Eidos AI
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Certificate.displayName = 'Certificate';

export default Certificate;
