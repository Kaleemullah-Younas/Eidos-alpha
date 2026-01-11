'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
    Users,
    BookOpen,
    Search,
    Clock,
    Layers,
    GraduationCap,
    Sparkles,
    BarChart3,
    CheckCircle2,
    Video,
    FileText,
    User,
    ExternalLink,
    Copy,
    Globe,
} from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';
import { getPublicCourses, copyCourse, Course, formatDuration, getProgressColor } from '@/lib/courseStorage';
import { useAuth } from '@/components/AuthProvider';
// Reuse existing course styles for consistency
import styles from '../course/course.module.css';

export default function PublicCoursesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCopying, setIsCopying] = useState<string | null>(null);
    const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);

    useEffect(() => {
        async function loadCourses() {
            try {
                const data = await getPublicCourses();
                setCourses(data);
            } catch (error) {
                console.error('Failed to load public courses:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadCourses();
    }, []);

    const handleCopyCourse = async (courseId: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if wrapped in Link (though we use div here)

        if (!user) {
            router.push('/login');
            return;
        }

        setIsCopying(courseId);
        try {
            const newCourse = await copyCourse(courseId);
            if (newCourse) {
                router.push(`/course/${newCourse.id}`);
            }
        } catch (error) {
            console.error('Failed to copy course:', error);
            setErrorModal({
                title: 'Enrollment Error',
                message: 'Failed to enroll in course. Please try again.'
            });
        } finally {
            setIsCopying(null);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getContentTypeCounts = (course: Course) => {
        let text = 0;
        let video = 0;
        course.chapters.forEach(ch => {
            ch.lessons.forEach(l => {
                if (l.type === 'text') text++;
                else video++;
            });
        });
        return { text, video };
    };

    return (
        <>
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Header Section */}
                    <div className={styles.hero}>
                        <h1>
                            <span className={styles.heroGradient}>Explore Community Courses</span>
                        </h1>
                        <p className={styles.heroText}>
                            Discover and enroll in AI-generated courses created by the Eidos community.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIcon}>
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search courses or authors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Courses Grid */}
                    <div className={styles.librarySection}>
                        {isLoading ? (
                            <div className={styles.courseGrid}>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={styles.courseCard} style={{ height: '300px', opacity: 0.5 }}></div>
                                ))}
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <Search size={32} />
                                </div>
                                <h3>No courses found</h3>
                                <p>Try adjusting your search terms.</p>
                            </div>
                        ) : (
                            <div className={styles.courseGrid}>
                                {filteredCourses.map((course) => {
                                    const counts = getContentTypeCounts(course);
                                    const isEnrolling = isCopying === course.id;
                                    const isEnrolled = !!course.enrolledId;
                                    const isOwner = user?.id === course.userId;

                                    return (
                                        <div key={course.id} className={styles.courseCard}>
                                            <div className={styles.courseHeader}>
                                                <div
                                                    className={styles.courseThumbnail}
                                                    style={{
                                                        background: `linear-gradient(135deg, ${getProgressColor(100)}, var(--accent-strong))`,
                                                    }}
                                                >
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                                    </svg>
                                                </div>

                                                {/* Enrollment Action */}
                                                <div className={styles.courseHeaderActions}>
                                                    <button
                                                        onClick={(e) => {
                                                            if (isOwner) {
                                                                router.push(`/course/${course.id}`);
                                                            } else if (isEnrolled) {
                                                                router.push(`/course/${course.enrolledId}`);
                                                            } else {
                                                                handleCopyCourse(course.id, e);
                                                            }
                                                        }}
                                                        className={styles.actionBtn}
                                                        title={isOwner ? "View Course" : isEnrolled ? "Continue Course" : "Start Course"}
                                                        disabled={isEnrolling}
                                                    >
                                                        {isEnrolling ? (
                                                            <Sparkles size={16} className={styles.spinner} />
                                                        ) : isOwner ? (
                                                            <ExternalLink size={16} />
                                                        ) : isEnrolled ? (
                                                            <CheckCircle2 size={16} color="var(--accent)" />
                                                        ) : (
                                                            <Copy size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className={styles.courseContent}>
                                                <span className={styles.difficultyBadge}>
                                                    {course.difficulty}
                                                </span>

                                                {/* Publisher Info */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                                                    {course.user?.image ? (
                                                        <img src={course.user.image} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                                                    ) : (
                                                        <User size={12} />
                                                    )}
                                                    <span>{course.user?.name || 'Unknown'}</span>
                                                </div>

                                                <h3>{course.title}</h3>
                                                <p>{course.description}</p>

                                                <div className={styles.courseMeta}>
                                                    <span>
                                                        <Clock size={14} />
                                                        {formatDuration(course.totalDuration)}
                                                    </span>
                                                    <span>
                                                        <BarChart3 size={14} />
                                                        {course.chapters.length} ch
                                                    </span>
                                                </div>

                                                <div className={styles.contentTypes}>
                                                    <span className={styles.typeTag}>
                                                        <FileText size={12} />
                                                        {counts.text} text
                                                    </span>
                                                    <span className={styles.typeTag}>
                                                        <Video size={12} />
                                                        {counts.video} video
                                                    </span>
                                                </div>

                                                <div
                                                    className={styles.courseFooter}
                                                    onClick={() => {
                                                        if (isOwner) {
                                                            router.push(`/course/${course.id}`);
                                                        } else if (isEnrolled) {
                                                            router.push(`/course/${course.enrolledId}`);
                                                        } else {
                                                            // Trigger enrollment programmatically
                                                            const syntheticEvent = { preventDefault: () => { } } as React.MouseEvent;
                                                            handleCopyCourse(course.id, syntheticEvent);
                                                        }
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <span>{isOwner ? 'View Course' : isEnrolled ? 'Continue Course' : 'Start Course'}</span>
                                                    <ExternalLink size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
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
        </>
    );
}
