'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { signOut } from '@/lib/auth-client';
import {
  Home,
  LayoutDashboard,
  Video,
  FileQuestion,
  Layers,
  Brain,
  Sun,
  Moon,
  LogOut,
  LogIn,
  Sparkles,
  GraduationCap,
  User,
  Users,
  ChevronDown,
} from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isHomepage = pathname === '/';

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      requiresAuth: true,
    },
    { href: '/capture', label: 'Capture', icon: Video, requiresAuth: false },
    { href: '/lecture', label: 'Lecture', icon: Sparkles, requiresAuth: false },
    {
      href: '/course',
      label: 'Course',
      icon: GraduationCap,
      requiresAuth: false,
    },
    { href: '/quiz', label: 'Quiz', icon: FileQuestion, requiresAuth: false },

    {
      href: '/public-courses',
      label: 'Public Courses',
      icon: Users,
      requiresAuth: false,
    },
    {
      href: '/study',
      label: 'Study',
      icon: Brain,
      highlight: true,
      requiresAuth: false,
    },
  ];

  // Filter nav items based on auth status
  const visibleNavItems = navItems.filter(item => !item.requiresAuth || user);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isHomepage) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  return (
    <>
      <header
        className={`${styles.header} ${isHomepage && isScrolled ? styles.headerHidden : ''
          }`}
      >
        <div className={`container ${styles.nav}`}>
          <Link href="/" className={styles.brand}>
            <span className={styles.logo}>
              <Image
                src="/logo.svg"
                alt="EIDOS Logo"
                width={32}
                height={30}
                priority
              />
            </span>
            <span className={styles.brandText}><strong> EIDOS</strong></span>
          </Link>

          <nav className={styles.links}>
            {visibleNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''
                  } ${item.highlight ? styles.highlight : ''}`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <button onClick={toggleTheme} className={styles.themeBtn}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user ? (
              <div className={styles.userMenuWrapper} ref={userMenuRef}>
                <button
                  className={styles.userMenuTrigger}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className={styles.userAvatar}
                    />
                  ) : (
                    <div className={styles.userAvatarPlaceholder}>
                      <User size={14} />
                    </div>
                  )}
                  <ChevronDown
                    size={14}
                    className={`${styles.chevron} ${userMenuOpen ? styles.chevronOpen : ''
                      }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className={styles.userMenu}>
                    <div className={styles.userMenuHeader}>
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className={styles.menuAvatar}
                        />
                      ) : (
                        <div className={styles.menuAvatarPlaceholder}>
                          <User size={20} />
                        </div>
                      )}
                      <div className={styles.menuUserInfo}>
                        <span className={styles.menuUserName}>{user.name}</span>
                        <span className={styles.menuUserEmail}>
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <div className={styles.userMenuDivider} />
                    <button
                      className={styles.userMenuItem}
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push('/dashboard');
                      }}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </button>
                    <div className={styles.userMenuDivider} />
                    <button
                      className={`${styles.userMenuItem} ${styles.logoutItem}`}
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={styles.signInBtn}>
                <LogIn size={16} style={{ marginRight: '2px' }} />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Floating sticky nav for homepage when scrolled */}
      {isHomepage && (
        <nav
          className={`${styles.stickyNav} ${isScrolled ? styles.stickyNavVisible : ''
            }`}
        >
          {visibleNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''
                } ${item.highlight ? styles.highlight : ''}`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
