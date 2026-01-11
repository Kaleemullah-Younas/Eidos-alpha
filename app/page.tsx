'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './landing.module.css';



const steps = [
  { 
    title: 'Upload & Capture',
    desc: 'Upload documents, paste text, or capture a live lecture with video + audio.',
    icon: '1'
  },
  { 
    title: 'AI Processing',
    desc: 'AI processes your content—Gemini organizes and understands everything.',
    icon: '2'
  },
  { 
    title: 'Learn & Master',
    desc: 'Generate notes, quizzes, or chat with your AI tutor to study.',
    icon: '3'
  },
];

const stats = [
  { value: '100+', label: 'Active Learners' },
  { value: '50+', label: 'Lectures Generated' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'AI Availability' },
];

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
      return () => hero.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll(`.${styles.animateOnScroll}`).forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <main className={styles.page}>
        {/* Particle effect container */}
        <div className={styles.particleContainer}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className={styles.particle} style={{ '--delay': `${i * 0.5}s` } as React.CSSProperties} />
          ))}
        </div>

        <section className={styles.hero} ref={heroRef}>
          {/* Mouse follow gradient */}
          <div 
            className={styles.mouseGlow}
            style={{ 
              left: mousePosition.x, 
              top: mousePosition.y,
            }}
          />
          
          <div className="container">
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <h1>Turn live lectures into<br /><span className={styles.gradientText}>study-ready kits</span></h1>
                <p className={styles.lead}>
                  Capture the room once—then generate clean notes, quizzes, and
                  study material in minutes. Designed for fast, distraction-free
                  studying.
                </p>

                <div className={styles.ctaRow}>
                  <Link href="/capture" className={`btn btn-primary ${styles.btnShine}`}>
                    <span>Start Capturing</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                  <Link href="/lecture" className={`btn btn-ghost ${styles.btnGhost}`}>
                    Generate Lecture
                  </Link>
                </div>

                {/* Stats row */}
                <div className={styles.statsRow}>
                  {stats.map((stat, i) => (
                    <div key={i} className={styles.statItem}>
                      <span className={styles.statValue}>{stat.value}</span>
                      <span className={styles.statLabel}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.heroPanel}>
                <div className={styles.panelGlow} />
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.panelEyebrow}>Study Workspace</p>
                    <p className={styles.panelTitle}>All-in-One Learning</p>
                  </div>
                  <span className={styles.statusDot}>
                    <span className={styles.pulse} />
                    AI Ready
                  </span>
                </div>

                <div className={styles.panelBody}>
                  <div className={styles.waveform}>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.panelStats}>
                    <div className={styles.panelStatCard}>
                      <p className={styles.statLabel}>Capture</p>
                      <p className={styles.statValue}>Video + Audio</p>
                    </div>
                    <div className={styles.panelStatCard}>
                      <p className={styles.statLabel}>Generate</p>
                      <p className={styles.statValue}>Lectures · Notes</p>
                    </div>
                    <div className={styles.panelStatCard}>
                      <p className={styles.statLabel}>Study</p>
                      <p className={styles.statValue}>Quiz · Cards · Chat</p>
                    </div>
                  </div>
                  <div className={styles.panelFooter}>
                    <p className={styles.panelHint}>
                      Powered by Gemini AI for intelligent content analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section className={styles.bentoFeatures}>
          <div className="container">
            <div className={styles.bentoFeaturesGrid}>
              {/* Large card - Capture */}
              <div className={`${styles.bentoFeatureCard} ${styles.bentoLarge} ${styles.animateOnScroll}`}>
                <div className={styles.bentoIllustration}>
                  <div className={styles.captureIllustration}>
                    <div className={styles.cameraIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div className={styles.waveLines}>
                      <span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <div className={styles.captureRing}></div>
                    <div className={styles.captureRing} style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
                <h3>Live Capture</h3>
              </div>

              {/* Medium card - AI Generation */}
              <div className={`${styles.bentoFeatureCard} ${styles.bentoMedium} ${styles.animateOnScroll}`}>
                <div className={styles.bentoIllustration}>
                  <div className={styles.aiIllustration}>
                    <div className={styles.aiCore}>
                      <div className={styles.aiPulse}></div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    </div>
                    <div className={styles.aiOrbit}>
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
                <h3>AI Generation</h3>
              </div>

              {/* Small card - Notes */}
              <div className={`${styles.bentoFeatureCard} ${styles.bentoSmall} ${styles.animateOnScroll}`}>
                <div className={styles.bentoIllustration}>
                  <div className={styles.notesIllustration}>
                    <div className={styles.noteStack}>
                      <div className={styles.notePage}></div>
                      <div className={styles.notePage}></div>
                      <div className={styles.notePage}>
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                </div>
                <h3>Smart Notes</h3>
              </div>

              {/* Small card - Quiz */}
              <div className={`${styles.bentoFeatureCard} ${styles.bentoSmall} ${styles.animateOnScroll}`}>
                <div className={styles.bentoIllustration}>
                  <div className={styles.quizIllustration}>
                    <div className={styles.quizCard}>
                      <div className={styles.quizOption}></div>
                      <div className={styles.quizOption} data-selected="true"></div>
                      <div className={styles.quizOption}></div>
                    </div>
                    <div className={styles.checkMark}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <h3>Quizzes</h3>
              </div>

              {/* Medium card - Tutor */}
              <div className={`${styles.bentoFeatureCard} ${styles.bentoMedium} ${styles.animateOnScroll}`}>
                <div className={styles.bentoIllustration}>
                  <div className={styles.tutorIllustration}>
                    <div className={styles.chatBubbles}>
                      <div className={styles.chatBubble} style={{ '--delay': '0s' } as React.CSSProperties}></div>
                      <div className={styles.chatBubble} style={{ '--delay': '0.3s' } as React.CSSProperties}></div>
                      <div className={styles.chatBubble} style={{ '--delay': '0.6s' } as React.CSSProperties}></div>
                    </div>
                    <div className={styles.tutorAvatar}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <h3>AI Tutor</h3>
              </div>

              {/* Wide card - Course */}
              <div className={`${styles.bentoFeatureCard} ${styles.bentoMedium} ${styles.animateOnScroll}`}>
                <div className={styles.bentoIllustration}>
                  <div className={styles.courseIllustration}>
                    <div className={styles.courseModules}>
                      <div className={styles.courseModule} data-complete="true"></div>
                      <div className={styles.courseModule} data-complete="true"></div>
                      <div className={styles.courseModule} data-active="true"></div>
                      <div className={styles.courseModule}></div>
                      <div className={styles.courseModule}></div>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill}></div>
                    </div>
                  </div>
                </div>
                <h3>Full Courses</h3>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.steps}>
          <div className="container">
            <div className={`${styles.sectionHeader} ${styles.animateOnScroll}`}>
              <p className={styles.eyebrow}>How it works</p>
              <h2>From content to mastery in three steps.</h2>
            </div>

            <div className={styles.stepsTimeline}>
              <div className={styles.timelineLine} />
              {steps.map((step, index) => (
                <div key={index} className={`${styles.stepCard} ${styles.animateOnScroll}`} style={{ '--index': index } as React.CSSProperties}>
                  <div className={styles.stepNumber}>
                    <span>{step.icon}</span>
                  </div>
                  <div className={styles.stepContent}>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.modes}>
          <div className="container">
            <div className={`${styles.sectionHeader} ${styles.animateOnScroll}`}>
              <p className={styles.eyebrow}>Study Modes</p>
              <h2>Multiple ways to learn and retain.</h2>
            </div>

            <div className={styles.modeGrid}>
              {[
                { href: '/dashboard', icon: '▦', title: 'Dashboard', desc: 'Manage study sessions, track streaks, and view your progress.' },
                { href: '/course', icon: '⬡', title: 'Course Generator', desc: 'Create complete AI courses with chapters and lessons.' },
                { href: '/lecture', icon: '◈', title: 'Lecture Generator', desc: 'Create written or video lectures on any topic with AI.' },
                { href: '/capture', icon: '◉', title: 'Live Capture', desc: 'Record lectures with video and audio for AI processing.' },
                { href: '/study', icon: '◇', title: 'AI Tutor', desc: 'Chat with an AI that understands your study materials.' },
                { href: '/quiz', icon: '▣', title: 'Quiz Mode', desc: 'Test yourself with auto-generated questions and explanations.' },
              ].map((mode, index) => (
                <Link 
                  key={mode.href} 
                  href={mode.href} 
                  className={`${styles.modeCard} ${styles.animateOnScroll}`}
                  style={{ '--index': index } as React.CSSProperties}
                >
                  <div className={styles.modeCardHover} />
                  <span className={styles.modeIcon}>{mode.icon}</span>
                  <h3>{mode.title}</h3>
                  <p>{mode.desc}</p>
                  <span className={styles.modeArrow}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.typographyShowcase}>
          <div className="container">
            <div className={styles.typographyContent}>
              <div className={styles.typographyLine}>
                <span className={styles.typographyWord} style={{ '--delay': '0s' } as React.CSSProperties}>The</span>
                <span className={`${styles.typographyWord} ${styles.typographyAccent}`} style={{ '--delay': '0.1s' } as React.CSSProperties}>
                  learning
                  <span className={styles.accentDot}></span>
                </span>
              </div>
              <div className={styles.typographyLine}>
                <span className={styles.typographyWord} style={{ '--delay': '0.2s' } as React.CSSProperties}>platform</span>
                <span className={`${styles.typographyWord} ${styles.typographyLinear}`} style={{ '--delay': '0.3s' } as React.CSSProperties}>for</span>
              </div>
              <div className={styles.typographyLine}>
                <span className={styles.typographyWord} style={{ '--delay': '0.4s' } as React.CSSProperties}>modern</span>
                <span className={`${styles.typographyWord} ${styles.typographyHighlight}`} style={{ '--delay': '0.5s' } as React.CSSProperties}>students</span>
              </div>
              
              <div className={styles.typographyDivider}>
                <span className={styles.dividerLine}></span>
              </div>
              
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className="container">
            <div className={`${styles.ctaCard} ${styles.animateOnScroll}`}>
              <div className={styles.ctaGlow} />
              <div className={styles.ctaContent}>
                <p className={styles.eyebrow}>Ready when you are</p>
                <h3>Start learning smarter today.</h3>
                <p className={styles.subtext}>
                  Capture lectures, generate study materials, and master any
                  subject with AI-powered tools.
                </p>
              </div>
              <div className={styles.ctaButtons}>
                <Link href="/dashboard" className={`btn btn-primary ${styles.btnShine}`}>
                  Open Dashboard
                </Link>
                <Link href="/study" className="btn btn-ghost">
                  Try AI Tutor
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerGrid}>
              <div className={styles.footerBrand}>
                <Link href="/" className={styles.footerLogo}>
                  <Image src="/logo.svg" alt="EIDOS Logo" width={32} height={36} />
                  <span>EIDOS</span>
                </Link>
                <p>Educational Intelligence & Dynamic Optimization System</p>
              </div>

              <div className={styles.footerLinks}>
                <h4>Study Tools</h4>
                <Link href="/course">Course Generator</Link>
                <Link href="/lecture">Lecture Generator</Link>
                <Link href="/capture">Live Capture</Link>
                <Link href="/quiz">Quiz Mode</Link>
              </div>

              <div className={styles.footerLinks}>
                <h4>Learn</h4>
                <Link href="/study">AI Tutor</Link>
                <Link href="/dashboard">Dashboard</Link>
              </div>

              <div className={styles.footerLinks}>
                <h4>Resources</h4>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer">
                  Gemini AI
                </a>
              </div>
            </div>

            <div className={styles.footerBottom}>
              <p>© {new Date().getFullYear()} EIDOS. Built with Gemini AI.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
