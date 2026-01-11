'use client';

import Link from 'next/link';
import { 
  BookOpen, 
  Rocket, 
  LayoutDashboard, 
  Video, 
  GraduationCap,
  FolderOpen,
  Presentation,
  FileQuestion,
  Bot,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import styles from './docs.module.css';

const guides = [
  {
    title: 'Getting Started',
    description: 'New to EIDOS? Learn the basics and get up and running in minutes.',
    icon: Rocket,
    href: '/docs/getting-started',
    badge: 'Start Here'
  },
  {
    title: 'Dashboard',
    description: 'Navigate your learning hub, manage sessions, and track progress.',
    icon: LayoutDashboard,
    href: '/docs/dashboard'
  },
  {
    title: 'Live Capture',
    description: 'Record lectures in real-time with automatic transcription and AI notes.',
    icon: Video,
    href: '/docs/capture'
  },
  {
    title: 'Course Architect',
    description: 'Generate complete courses from any topic using AI.',
    icon: GraduationCap,
    href: '/docs/courses'
  },
  {
    title: 'Study Sessions',
    description: 'Organize materials, upload documents, and study effectively.',
    icon: FolderOpen,
    href: '/docs/study'
  },
  {
    title: 'Lecture Generator',
    description: 'Create written or video lectures on any subject instantly.',
    icon: Presentation,
    href: '/docs/lectures'
  },
  {
    title: 'Quizzes',
    description: 'Test your knowledge with AI-generated assessments.',
    icon: FileQuestion,
    href: '/docs/quizzes'
  },
  {
    title: 'AI Tutor',
    description: 'Get instant help from your personal AI study assistant.',
    icon: Bot,
    href: '/docs/ai-tutor'
  }
];

export default function DocsPage() {
  return (
    <div className={styles.docsPage}>
      <div className={styles.docsContainer}>
        {/* Header */}
        <header className={styles.docsHeader}>
          <div className={styles.docsLogo}>
            <div className={styles.logoIcon}>
              <BookOpen size={24} />
            </div>
            <h1 className={styles.docsTitle}>EIDOS Documentation</h1>
          </div>
          <p className={styles.docsSubtitle}>
            Everything you need to master EIDOS and accelerate your learning journey
          </p>
        </header>

        {/* Quick Start */}
        <div className={styles.quickStart}>
          <h2 className={styles.quickStartTitle}>
            <Sparkles size={20} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--accent)' }} />
            New to EIDOS?
          </h2>
          <p className={styles.quickStartText}>
            Get started in just 5 minutes with our beginner&apos;s guide
          </p>
          <Link href="/docs/getting-started" className={styles.quickStartBtn}>
            Start Learning <ArrowRight size={18} />
          </Link>
        </div>

        {/* Guides Grid */}
        <section className={styles.docsSection}>
          <h2 className={styles.sectionTitle}>
            <BookOpen size={24} />
            Feature Guides
          </h2>
          <div className={styles.docsGrid}>
            {guides.map((guide) => (
              <Link key={guide.href} href={guide.href} className={styles.docCard}>
                <div className={styles.cardIcon}>
                  <guide.icon size={24} />
                </div>
                {guide.badge && <span className={styles.cardBadge}>{guide.badge}</span>}
                <h3 className={styles.cardTitle}>{guide.title}</h3>
                <p className={styles.cardDescription}>{guide.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer Navigation */}
        <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <Link href="/dashboard" className={styles.backLink}>
            <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
