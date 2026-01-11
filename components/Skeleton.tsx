'use client';

import styles from './Skeleton.module.css';

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
  gap?: string;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  count = 1,
  gap = '0.75rem',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? width : undefined),
  };

  if (count > 1) {
    return (
      <div className={styles.skeletonGroup} style={{ gap }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${styles.skeleton} ${styles[variant]} ${className}`}
            style={{
              ...style,
              width: variant === 'text' && i === count - 1 ? '60%' : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton layouts for common use cases
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.cardSkeleton}>
          <Skeleton variant="rectangular" height="120px" />
          <div className={styles.cardSkeletonContent}>
            <Skeleton variant="text" width="70%" height="1.25rem" />
            <Skeleton variant="text" count={2} height="0.875rem" />
            <div className={styles.cardSkeletonFooter}>
              <Skeleton variant="rectangular" width="80px" height="24px" />
              <Skeleton variant="circular" width="32px" height="32px" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function TableRowSkeleton({ columns = 4, count = 5 }: { columns?: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.tableRowSkeleton}>
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton
              key={j}
              variant="text"
              width={j === 0 ? '40%' : j === columns - 1 ? '60px' : '80%'}
              height="1rem"
            />
          ))}
        </div>
      ))}
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <div className={styles.dashboardSkeleton}>
      {/* Stats row */}
      <div className={styles.statsGridSkeleton}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.statCardSkeleton}>
            <Skeleton variant="circular" width="48px" height="48px" />
            <div className={styles.statTextSkeleton}>
              <Skeleton variant="text" width="60%" height="0.875rem" />
              <Skeleton variant="text" width="40%" height="1.5rem" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className={styles.contentGridSkeleton}>
        <div className={styles.sectionSkeleton}>
          <Skeleton variant="text" width="150px" height="1.25rem" />
          <div className={styles.cardsGridSkeleton}>
            <CardSkeleton count={3} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LectureSkeleton() {
  return (
    <div className={styles.lectureSkeleton}>
      {/* Tabs */}
      <div className={styles.tabsSkeleton}>
        <Skeleton variant="rectangular" width="100px" height="40px" />
        <Skeleton variant="rectangular" width="100px" height="40px" />
        <Skeleton variant="rectangular" width="100px" height="40px" />
      </div>

      {/* Input area */}
      <div className={styles.inputAreaSkeleton}>
        <Skeleton variant="text" width="120px" height="1rem" />
        <Skeleton variant="rectangular" height="48px" />
        <Skeleton variant="rectangular" width="150px" height="44px" />
      </div>

      {/* Content area */}
      <div className={styles.contentAreaSkeleton}>
        <Skeleton variant="text" count={6} height="1rem" />
      </div>
    </div>
  );
}

export function QuizSkeleton() {
  return (
    <div className={styles.quizSkeleton}>
      {/* Question header */}
      <div className={styles.questionHeaderSkeleton}>
        <Skeleton variant="text" width="60%" height="1.5rem" />
        <Skeleton variant="text" width="80%" height="1rem" />
      </div>

      {/* Options */}
      <div className={styles.optionsSkeleton}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="56px" />
        ))}
      </div>

      {/* Navigation */}
      <div className={styles.navSkeleton}>
        <Skeleton variant="rectangular" width="100px" height="40px" />
        <Skeleton variant="text" width="80px" height="1rem" />
        <Skeleton variant="rectangular" width="100px" height="40px" />
      </div>
    </div>
  );
}

export function CourseSkeleton() {
  return (
    <div className={styles.courseSkeleton}>
      {/* Header */}
      <div className={styles.courseHeaderSkeleton}>
        <Skeleton variant="text" width="200px" height="2rem" />
        <Skeleton variant="rectangular" width="140px" height="44px" />
      </div>

      {/* Course cards grid */}
      <div className={styles.courseGridSkeleton}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.courseCardSkeleton}>
            <div className={styles.courseCardHeaderSkeleton}>
              <Skeleton variant="rectangular" width="100%" height="8px" />
            </div>
            <div className={styles.courseCardBodySkeleton}>
              <Skeleton variant="text" width="80%" height="1.25rem" />
              <Skeleton variant="text" count={2} height="0.875rem" />
              <div className={styles.courseCardMetaSkeleton}>
                <Skeleton variant="rectangular" width="60px" height="20px" />
                <Skeleton variant="rectangular" width="80px" height="20px" />
                <Skeleton variant="rectangular" width="70px" height="20px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudySkeleton() {
  return (
    <div className={styles.studySkeleton}>
      {/* Sidebar */}
      <div className={styles.studySidebarSkeleton}>
        <Skeleton variant="text" width="120px" height="1.25rem" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="48px" />
        ))}
      </div>

      {/* Chat area */}
      <div className={styles.studyChatSkeleton}>
        <div className={styles.chatMessagesSkeleton}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`${styles.messageSkeleton} ${i % 2 === 0 ? styles.user : styles.assistant}`}
            >
              <Skeleton
                variant="rectangular"
                width={i % 2 === 0 ? '60%' : '80%'}
                height={i % 2 === 0 ? '48px' : '96px'}
              />
            </div>
          ))}
        </div>
        <div className={styles.chatInputSkeleton}>
          <Skeleton variant="rectangular" height="48px" />
        </div>
      </div>
    </div>
  );
}

export function CaptureSkeleton() {
  return (
    <div className={styles.captureSkeleton}>
      {/* Video preview area */}
      <div className={styles.captureVideoSkeleton}>
        <Skeleton variant="rectangular" height="100%" />
      </div>

      {/* Controls */}
      <div className={styles.captureControlsSkeleton}>
        <Skeleton variant="circular" width="64px" height="64px" />
        <div className={styles.captureButtonsSkeleton}>
          <Skeleton variant="rectangular" width="100px" height="40px" />
          <Skeleton variant="rectangular" width="100px" height="40px" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
