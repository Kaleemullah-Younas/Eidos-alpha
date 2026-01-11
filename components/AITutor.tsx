'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, X, Mic, Loader2 } from 'lucide-react';
import styles from './AITutor.module.css';

interface AITutorProps {
    context: string;
}

// Interrupt phrases that should stop the AI from speaking
const INTERRUPT_PATTERNS = [
    'stop',
    'stop stop',
    'hey',
    'hey hey',
    'wait',
    'wait wait',
    'hold on',
    'pause',
    'excuse me',
    'one second',
    'hang on',
];

export default function AITutor({ context }: AITutorProps) {
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(true);

    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isActiveRef = useRef(false);
    const isSpeakingRef = useRef(false);

    // Keep refs in sync
    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    // Check support on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setIsSupported(false);
                setError('Speech recognition not supported. Use Chrome or Edge.');
            }
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch { }
            }
            if (audioRef.current) {
                audioRef.current.pause();
            }
            // Cancel any ongoing speech synthesis
            window.speechSynthesis?.cancel();
        };
    }, []);

    // Check if text contains an interrupt phrase
    const isInterruptPhrase = useCallback((text: string): boolean => {
        const normalized = text.toLowerCase().trim();
        return INTERRUPT_PATTERNS.some(pattern => {
            // Check for exact match or pattern at the start/end
            return normalized === pattern ||
                normalized.startsWith(pattern + ' ') ||
                normalized.endsWith(' ' + pattern) ||
                normalized.includes(' ' + pattern + ' ');
        });
    }, []);

    // Handle interrupt - stop speaking and resume listening
    const handleInterrupt = useCallback(() => {
        console.log('Interrupt detected!');
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
        setStatus('listening');
        setTranscript('Listening...');
        setResponse('');
    }, []);

    const processQuestion = useCallback(async (question: string) => {
        if (!question.trim()) return;

        // Don't process interrupt phrases as questions
        if (isInterruptPhrase(question)) {
            return;
        }

        setStatus('thinking');
        setTranscript(question);

        try {
            const res = await fetch('/api/tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, context })
            });

            if (!res.ok) throw new Error('API error');

            const data = await res.json();

            if (data.answer) {
                setResponse(data.answer);
                await speakResponse(data.answer);
            } else {
                throw new Error('No answer received');
            }
        } catch (err) {
            console.error('Tutor error:', err);
            setError('Failed to get response. Try again.');
            setStatus('listening');
            setTranscript('Listening...');
        }
    }, [context, isInterruptPhrase]);

    const speakResponse = useCallback((text: string) => {
        setStatus('speaking');
        isSpeakingRef.current = true;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Use browser's native speech synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to get a female voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v =>
            v.name.includes('Zira') ||      // Windows female
            v.name.includes('Samantha') ||  // macOS female
            v.name.includes('Google US English') || // Chrome (usually female)
            v.name.includes('Female') ||
            v.name.includes('Aria')         // Windows 11
        ) || voices.find(v => v.lang.startsWith('en'));

        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        utterance.onend = () => {
            isSpeakingRef.current = false;
            if (isActiveRef.current) {
                setStatus('listening');
                setTranscript('Listening...');
            }
        };

        utterance.onerror = () => {
            isSpeakingRef.current = false;
            if (isActiveRef.current) {
                setStatus('listening');
                setTranscript('Listening...');
            }
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const startListeningLoop = useCallback(() => {
        if (!isSupported) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        // Create recognition instance
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening continuously
        recognition.interimResults = true; // Get partial results for interrupt detection
        recognition.lang = 'en-US';

        recognitionRef.current = recognition;

        recognition.onstart = () => {
            console.log('Listening started');
            if (!isSpeakingRef.current) {
                setStatus('listening');
                setTranscript('Listening...');
            }
            setError(null);
        };

        recognition.onresult = (event: any) => {
            // Get the latest result
            const latestIndex = event.results.length - 1;
            const result = event.results[latestIndex];
            const text = result[0].transcript;

            // Check for interrupt while speaking
            if (isSpeakingRef.current && isInterruptPhrase(text)) {
                handleInterrupt();
                return;
            }

            // Only update transcript if not speaking
            if (!isSpeakingRef.current) {
                setTranscript(text);
            }

            // Process final result as a question
            if (result.isFinal && !isSpeakingRef.current) {
                const finalText = text.trim();
                if (finalText && !isInterruptPhrase(finalText)) {
                    console.log('Processing question:', finalText);
                    processQuestion(finalText);
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setError('Please allow microphone access');
                setStatus('idle');
            } else if (event.error === 'no-speech') {
                // Silently restart if still active
                if (isActiveRef.current) {
                    setTimeout(() => {
                        if (isActiveRef.current) {
                            startListeningLoop();
                        }
                    }, 500);
                }
            } else if (event.error !== 'aborted') {
                setError(`Error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            console.log('Recognition ended');
            // Auto-restart if still active
            if (isActiveRef.current) {
                setTimeout(() => {
                    if (isActiveRef.current) {
                        startListeningLoop();
                    }
                }, 100);
            }
        };

        try {
            recognition.start();
        } catch (e) {
            console.error('Start error:', e);
            setError('Could not start listening');
        }
    }, [isSupported, processQuestion, isInterruptPhrase, handleInterrupt]);

    const startCall = () => {
        setIsActive(true);
        setError(null);
        setResponse('');

        if (!isSupported) {
            setError('Speech recognition not supported');
            return;
        }

        // Start listening immediately
        startListeningLoop();
    };

    const stopCall = () => {
        setIsActive(false);
        setStatus('idle');
        setTranscript('');
        setResponse('');
        isSpeakingRef.current = false;

        // Stop speech recognition
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { }
        }

        // Stop audio playback
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }

        // Cancel any ongoing speech synthesis
        window.speechSynthesis.cancel();
    };

    if (!isActive) {
        return (
            <div className={styles.container}>
                <button className={styles.tutorBtn} onClick={startCall} title="Talk to AI Tutor">
                    <Sparkles size={24} />
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.callOverlay}>
                <div className={`${styles.statusIndicator} ${styles[status]}`}>
                    {status === 'listening' && (
                        <>
                            <Mic size={32} />
                            <div className={styles.wave}></div>
                            <div className={styles.wave}></div>
                            <div className={styles.wave}></div>
                        </>
                    )}
                    {status === 'thinking' && <Loader2 size={32} className={styles.spin} />}
                    {status === 'speaking' && (
                        <div className={styles.bars}>
                            <div className={styles.bar}></div>
                            <div className={styles.bar}></div>
                            <div className={styles.bar}></div>
                            <div className={styles.bar}></div>
                            <div className={styles.bar}></div>
                        </div>
                    )}
                </div>

                <div className={styles.statusText}>
                    {status === 'listening' ? 'Listening... (say "stop" or "hey" to interrupt)' :
                        status === 'thinking' ? 'Thinking...' :
                            status === 'speaking' ? 'Speaking... (say "stop" to interrupt)' : 'Ready'}
                </div>

                <p className={styles.transcript}>
                    {error ? (
                        <span style={{ color: '#ef4444' }}>{error}</span>
                    ) : (
                        status === 'speaking' ? response : transcript
                    )}
                </p>
            </div>

            <button className={`${styles.tutorBtn} ${styles.active}`} onClick={stopCall}>
                <X size={24} />
            </button>
        </div>
    );
}
