'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './not-found.module.css';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.glowOrb} />
        <div className={`${styles.errorCode} ${mounted ? styles.visible : ''}`}>
          <span>4</span>
          <span className={styles.middle}>0</span>
          <span>4</span>
        </div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={`btn btn-primary ${styles.btn}`}>
            Go Home
          </Link>
          <Link href="/dashboard" className={`btn btn-ghost ${styles.btn}`}>
            Dashboard
          </Link>
        </div>
      </div>
      <div className={styles.particles}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className={styles.particle} style={{ '--delay': `${i * 0.3}s` } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
