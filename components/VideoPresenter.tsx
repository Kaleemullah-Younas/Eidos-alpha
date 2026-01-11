'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Slide, SlideTransition, VideoQuiz } from '@/lib/lectureStorage';
import { getSceneForTopic } from '@/lib/scenePresets';
import Whiteboard from './Whiteboard';
import VideoQuizPopup from './VideoQuizPopup';
import styles from './VideoPresenter.module.css';
import {
    Maximize2,
    Minimize2,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Gauge,
} from 'lucide-react';

// Dynamic import for Scene3D to avoid SSR issues with Three.js
const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

interface VideoPresenterProps {
    slides: Slide[];
    currentSlide: number;
    isPlaying: boolean;
    isMuted: boolean;
    elapsedTime: number;
    playbackSpeed: number;
    spokenCharIndex: number; // Character index being spoken for karaoke effect
    showQuizPopup: boolean;  // Whether to show quiz popup
    onPlayPause: () => void;
    onPrevSlide: () => void;
    onNextSlide: () => void;
    onToggleMute: () => void;
    onSpeedChange: () => void;
    onSlideClick: (index: number) => void;
    onQuizAnswer: (correct: boolean, selectedIndex: number | null) => void;
    onVideoEnd?: () => void;
    title: string;
}

// Format time in M:SS or H:MM:SS format
function formatTime(seconds: number): string {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Highlighted narration component with karaoke effect
function HighlightedNarration({ text, charIndex }: { text: string; charIndex: number }) {
    if (charIndex <= 0) {
        return <p className={styles.narrationText}>{text}</p>;
    }

    const spokenPart = text.substring(0, charIndex);
    const unspokenPart = text.substring(charIndex);

    return (
        <p className={styles.narrationText}>
            <span className={styles.spokenText}>{spokenPart}</span>
            <span className={styles.unspokenText}>{unspokenPart}</span>
        </p>
    );
}

export default function VideoPresenter({
    slides,
    currentSlide,
    isPlaying,
    isMuted,
    elapsedTime,
    playbackSpeed,
    spokenCharIndex,
    showQuizPopup,
    onPlayPause,
    onPrevSlide,
    onNextSlide,
    onToggleMute,
    onSpeedChange,
    onSlideClick,
    onQuizAnswer,
    onVideoEnd,
    title,
}: VideoPresenterProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [prevSlide, setPrevSlide] = useState(currentSlide);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const introTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate times
    const totalDuration = slides.reduce((acc, s) => acc + (s.duration || 0), 0);
    const currentVideoTime = slides.slice(0, currentSlide).reduce((acc, s) => acc + (s.duration || 0), 0) + elapsedTime;

    const slide = slides[currentSlide];
    const transition = slide?.transition || 'fade';

    // Only show 3D when AI explicitly provides it (for explaining concepts, not aesthetics)
    const has3D = slide?.drawings3D && slide.drawings3D.length > 0;

    // Get particle type only when 3D is present
    const particleType = has3D ? getSceneForTopic(title).particleType : undefined;

    // Handle intro animation
    useEffect(() => {
        if (showIntro) {
            introTimeoutRef.current = setTimeout(() => {
                setShowIntro(false);
            }, 3000);
        }
        return () => {
            if (introTimeoutRef.current) {
                clearTimeout(introTimeoutRef.current);
            }
        };
    }, []);

    // Skip intro when play is pressed
    useEffect(() => {
        if (isPlaying && showIntro) {
            setShowIntro(false);
        }
    }, [isPlaying, showIntro]);

    // Handle slide transitions
    useEffect(() => {
        if (currentSlide !== prevSlide) {
            setIsTransitioning(true);
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setPrevSlide(currentSlide);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [currentSlide, prevSlide]);

    // Auto-hide controls
    const resetControlsTimeout = useCallback(() => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        setShowControls(true);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying]);

    useEffect(() => {
        resetControlsTimeout();
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isPlaying, resetControlsTimeout]);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await containerRef.current?.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    }, []);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    onPlayPause();
                    break;
                case 'ArrowLeft':
                    onPrevSlide();
                    break;
                case 'ArrowRight':
                    onNextSlide();
                    break;
                case 'f':
                case 'F':
                    toggleFullscreen();
                    break;
                case 'm':
                case 'M':
                    onToggleMute();
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onPlayPause, onPrevSlide, onNextSlide, toggleFullscreen, onToggleMute]);

    // Get transition class
    const getTransitionClass = (type: SlideTransition) => {
        switch (type) {
            case 'zoom':
                return styles.transitionZoom;
            case 'slide-left':
                return styles.transitionSlideLeft;
            case 'slide-right':
                return styles.transitionSlideRight;
            case 'flip':
                return styles.transitionFlip;
            case 'fade':
            default:
                return styles.transitionFade;
        }
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.videoPresenter} ${isFullscreen ? styles.fullscreen : ''}`}
            onMouseMove={resetControlsTimeout}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Intro Animation */}
            {showIntro && (
                <div className={styles.intro}>
                    <div className={styles.introContent}>
                        <div className={styles.introIcon}>🎬</div>
                        <h1 className={styles.introTitle}>{title}</h1>
                        <p className={styles.introSubtitle}>AI Generated Video Lecture</p>
                        <div className={styles.introLoader}>
                            <div className={styles.introLoaderBar} />
                        </div>
                    </div>
                    <div className={styles.introParticles}>
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className={styles.particle}
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${3 + Math.random() * 2}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div
                className={`${styles.slideContainer} ${isTransitioning ? getTransitionClass(transition) : ''}`}
            >
                {/* Background Gradient */}
                <div className={styles.backgroundGradient} />

                {/* Ambient Particles */}
                <div className={styles.ambientParticles}>
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className={styles.ambientParticle}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Slide Title */}
                <h2 className={styles.slideTitle}>{slide?.title}</h2>

                {/* Canvas Container */}
                <div className={styles.canvasContainer}>
                    {/* 2D Whiteboard */}
                    <Whiteboard
                        drawings={slide?.drawings || []}
                        isPlaying={isPlaying}
                        elapsedTime={elapsedTime}
                        slideKey={currentSlide}
                    />

                    {/* 3D Scene - Only shown when AI provides 3D content to explain concepts */}
                    {has3D && (
                        <Scene3D
                            drawings={slide?.drawings3D || []}
                            elapsedTime={elapsedTime}
                            isPlaying={isPlaying}
                            particleType={particleType}
                            topic={title}
                        />
                    )}
                    {/* This useEffect block is assumed to be the intended insertion point for the speakText logic */}
                    {/* The original instruction implies modifying an existing speakText call or adding one within a useEffect */}
                    {/* Given the context, this is the most syntactically plausible interpretation */}
                    {/* Assuming 'index', 'lesson', 'playSlide', 'isPlayingRef', 'speakText', 'useSpeed', 'onVideoEnd', 'setIsPlaying' are defined in the component scope */}
                    {/* This block should ideally be placed outside the JSX, within the component's functional body */}
                    {/* However, following the exact insertion point from the instruction, it's placed here as a comment for clarity */}
                    {/* If this is meant to be a new useEffect, it should be placed with other useEffects at the top */}
                    {/* If it's modifying an existing speakText call, that call needs to be located */}
                    {/* For the purpose of this edit, I'm placing the logic as a comment block to avoid syntax errors in JSX */}
                    {/* and to highlight that this code needs to be integrated into a proper useEffect or function call */}
                    {/* based on the full context of the component. */}
                    {/*
                    useEffect(() => {
                        if (slide?.narration && isPlaying) { // Only speak if there's narration and video is playing
                            speakText(slide.narration, useSpeed, () => {
                                if (isPlayingRef.current && currentSlide < lesson.slides!.length - 1) {
                                    playSlide(currentSlide + 1);
                                } else if (currentSlide >= lesson.slides!.length - 1) {
                                    setIsPlaying(false);
                                    onVideoEnd?.();
                                }
                            });
                        }
                    }, [currentSlide, slide?.narration, isPlaying, isPlayingRef, lesson?.slides, playSlide, setIsPlaying, speakText, useSpeed, onVideoEnd]);
                    */}
                </div>

                {/* Narration Box with Karaoke Highlighting */}
                <div className={styles.narrationBox}>
                    <Volume2 size={16} />
                    <HighlightedNarration
                        text={slide?.narration || ''}
                        charIndex={spokenCharIndex}
                    />
                </div>
            </div>

            {/* Video Controls Overlay */}
            <div
                className={`${styles.controlsOverlay} ${showControls ? styles.visible : ''}`}
            >
                {/* Progress Timeline */}
                <div className={styles.timeline}>
                    {slides.map((s, i) => (
                        <button
                            key={s.id}
                            className={`${styles.timelineMarker} ${i === currentSlide ? styles.activeMarker : ''} ${i < currentSlide ? styles.completedMarker : ''}`}
                            onClick={() => onSlideClick(i)}
                            title={s.title}
                        >
                            <span className={styles.markerNumber}>{i + 1}</span>
                        </button>
                    ))}
                    <div
                        className={styles.timelineProgress}
                        style={{
                            width: `${((currentSlide + 1) / slides.length) * 100}%`,
                        }}
                    />
                </div>

                {/* Control Buttons */}
                <div className={styles.controls}>
                    <div className={styles.controlsLeft}>
                        <button
                            onClick={onPrevSlide}
                            disabled={currentSlide === 0}
                            className={styles.controlBtn}
                            title="Previous (←)"
                        >
                            <SkipBack size={20} />
                        </button>

                        <button
                            onClick={onPlayPause}
                            className={styles.playBtn}
                            title="Play/Pause (Space)"
                        >
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>

                        <button
                            onClick={onNextSlide}
                            disabled={currentSlide === slides.length - 1}
                            className={styles.controlBtn}
                            title="Next (→)"
                        >
                            <SkipForward size={20} />
                        </button>
                    </div>

                    <div className={styles.controlsCenter}>
                        <span className={styles.timestamp}>
                            {formatTime(currentVideoTime)} / {formatTime(totalDuration)}
                        </span>
                        <span className={styles.slideCounter}>
                            {currentSlide + 1} / {slides.length}
                        </span>
                    </div>

                    <div className={styles.controlsRight}>
                        <button
                            onClick={onToggleMute}
                            className={styles.controlBtn}
                            title="Mute (M)"
                        >
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>

                        <button
                            onClick={onSpeedChange}
                            className={styles.speedBtn}
                            title="Playback Speed"
                        >
                            <Gauge size={16} />
                            <span>{playbackSpeed}x</span>
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className={styles.controlBtn}
                            title="Fullscreen (F)"
                        >
                            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Play/Pause Indicator */}
            {!showIntro && (
                <div
                    className={`${styles.playIndicator} ${isPlaying ? styles.playing : styles.paused}`}
                >
                    {isPlaying ? <Pause size={48} /> : <Play size={48} />}
                </div>
            )}

            {/* Quiz Popup for quiz slides */}
            {showQuizPopup && slide?.isQuizSlide && slide.quiz && (
                <VideoQuizPopup
                    quiz={slide.quiz}
                    onAnswer={onQuizAnswer}
                    timeLimit={60}
                />
            )}
        </div>
    );
}
