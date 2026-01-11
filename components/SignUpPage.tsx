'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { signUp, signIn } from '@/lib/auth-client';
import {
    GraduationCap,
    Sun,
    Moon,
    Eye,
    EyeOff,
    UserPlus,
    Loader2,
    AlertCircle,
    Github,
} from 'lucide-react';
import styles from './Login.module.css';

export default function SignUpPage() {
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const result = await signUp.email({
                email,
                password,
                name,
            });

            if (result.error) {
                setError(result.error.message || 'Failed to create account');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('An error occurred. Please try again.');
        }

        setLoading(false);
    };

    const handleGithubSignUp = async () => {
        setGithubLoading(true);
        setError('');

        try {
            await signIn.social({
                provider: 'github',
                callbackURL: '/dashboard',
            });
        } catch {
            setError('Failed to sign up with GitHub');
            setGithubLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        setError('');

        try {
            await signIn.social({
                provider: 'google',
                callbackURL: '/dashboard',
            });
        } catch {
            setError('Failed to sign up with Google');
            setGoogleLoading(false);
        }
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.box}>
                    <div className={styles.header}>
                        <div className={styles.logoIcon}>
                            <svg width="32" height="38" viewBox="0 0 40 48" fill="none">
                              <path d="M19.6007 4.95239C16.134 4.95239 13.334 7.71836 13.334 11.1429C13.334 14.5411 16.134 17.307 19.574 17.3333C18.7206 17.307 18.054 16.6221 18.054 15.7791C18.054 14.9362 18.7473 14.225 19.6273 14.225C23.3606 14.225 31.654 14.2249 35.3073 14.2249C37.894 14.2249 40.0007 12.1439 40.0007 9.5887C40.0007 7.03344 37.894 4.95239 35.3073 4.95239L19.6007 4.95239Z" fill="#19B8AB"/>
                              <path d="M11.9815 17.3333C8.51484 17.3333 5.71484 20.0992 5.71484 23.5237C5.71484 26.9219 8.51484 29.6878 11.9548 29.7142C11.1015 29.6878 10.4348 29.003 10.4348 28.16C10.4348 27.317 11.1282 26.6058 12.0082 26.6058C15.7415 26.6058 24.0349 26.6058 27.6882 26.6058C30.2748 26.6058 32.3815 24.5248 32.3815 21.9696C32.3815 19.4143 30.2748 17.3333 27.6882 17.3333L11.9815 17.3333Z" fill="#21BAC8"/>
                              <path d="M6.71429 29.7144C3 29.7144 -1.08238e-07 32.6931 0 36.381C1.07406e-07 40.0406 3 43.0193 6.68569 43.0477C5.77142 43.0193 5.05714 42.2818 5.05714 41.3739C5.05714 40.4661 5.80002 39.7002 6.74288 39.7002C10.7428 39.7002 19.6286 39.7002 23.5429 39.7002C26.3143 39.7002 28.5714 37.4591 28.5714 34.7073C28.5714 31.9555 26.3143 29.7144 23.5429 29.7144L6.71429 29.7144Z" fill="#23D4D4"/>
                            </svg>
                        </div>
                        <h1>EIDOS</h1>
                        <p className={styles.subtitle}>
                            Educational Intelligence & Dynamic Optimization System
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <h2>Create Account</h2>

                        <div className={styles.formGroup}>
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <div className={styles.passwordField}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className={styles.input}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className={styles.passwordField}>
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className={styles.error}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className={styles.submitBtn}>
                            {loading ? (
                                <>
                                    <Loader2 size={18} className={styles.spin} />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Sign Up
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <div className={styles.socialButtons}>
                        <button
                            type="button"
                            onClick={handleGithubSignUp}
                            disabled={githubLoading || googleLoading}
                            className={styles.githubBtn}
                        >
                            {githubLoading ? (
                                <Loader2 size={18} className={styles.spin} />
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                            )}
                            <span>GitHub</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            disabled={googleLoading || githubLoading}
                            className={styles.googleBtn}
                        >
                            {googleLoading ? (
                                <Loader2 size={18} className={styles.spin} />
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            )}
                            <span>Google</span>
                        </button>
                    </div>

                    <div className={styles.signupLink}>
                        <p>
                            Already have an account?{' '}
                            <Link href="/login">Sign in</Link>
                        </p>
                    </div>


                </div>
            </div>
        </>
    );
}
