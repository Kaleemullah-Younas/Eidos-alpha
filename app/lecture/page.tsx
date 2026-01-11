'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/components/AuthProvider';
import VideoPresenter from '@/components/VideoPresenter';
import InteractiveLecture from '@/components/InteractiveLecture';
import AITutor from '@/components/AITutor';
import {
  Video,
  FileText,
  Sparkles,
  Download,
  Clock,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Save,
  FileQuestion,
  Layers,
  History,
  Trash2,
} from 'lucide-react';
import {
  saveWrittenLecture,
  saveVideoLecture,
  setLectureForStudy,
  getAllLectures,
  deleteLecture,
  setCurrentLectureId,
  type SavedLecture,
  type VideoLecture,
} from '@/lib/lectureStorage';
import styles from './lecture.module.css';
import ConfirmationModal from '@/components/ConfirmationModal';
import CustomSelect from '@/components/CustomSelect';

type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function LecturePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'written' | 'video' | 'saved'>(
    'written'
  );
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(3);

  // Written lecture state
  const [writtenContent, setWrittenContent] = useState('');
  const [isGeneratingWritten, setIsGeneratingWritten] = useState(false);
  const [copied, setCopied] = useState(false);

  // Video lecture state
  const [videoLecture, setVideoLecture] = useState<VideoLecture | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [slideElapsedTime, setSlideElapsedTime] = useState(0); // Elapsed time in current slide

  // Saved lectures state
  const [savedLectures, setSavedLectures] = useState<SavedLecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<SavedLecture | null>(
    null
  );
  const [savedMessage, setSavedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<string | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  // Current lecture ID (for tracking saved state)
  const [currentLectureIdState, setCurrentLectureIdState] = useState<
    string | null
  >(null);

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef(false);
  const playbackSpeedRef = useRef<PlaybackSpeed>(1);
  const isCancelledRef = useRef(false); // Track intentional cancellations
  const slideStartTimeRef = useRef<number>(0); // Track when current slide started
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null); // Timer for elapsed time

  // Karaoke-style highlighting: track spoken character index
  const [spokenCharIndex, setSpokenCharIndex] = useState(0);

  // Quiz slide state
  const [showQuizPopup, setShowQuizPopup] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Keep refs in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  // Check speech synthesis support
  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
  }, []);

  // Load saved lectures
  useEffect(() => {
    async function load() {
      try {
        setSavedLectures(await getAllLectures());
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Cleanup on unmount - stop speech and timer
  useEffect(() => {
    return () => {
      // Mark as cancelled before stopping speech to prevent any callbacks
      isCancelledRef.current = true;
      window.speechSynthesis?.cancel();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Stop speech when navigating away from this page (for client-side navigation)
  useEffect(() => {
    // When pathname changes from '/lecture' to something else, cancel speech
    if (pathname !== '/lecture') {
      isCancelledRef.current = true;
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [pathname]);

  // Timer for elapsed time in current slide (for whiteboard animations)
  useEffect(() => {
    if (isPlaying) {
      // Use a delta-based approach to account for playback speed
      let lastTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const delta = (now - lastTime) / 1000;
        lastTime = now;

        setSlideElapsedTime(prev => prev + (delta * playbackSpeedRef.current));
      }, 50); // Update every 50ms for smooth animations
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Function to speak text with current speed
  const speakText = useCallback(
    (text: string, speed: PlaybackSpeed, onEnd?: () => void) => {
      if (!speechSupported || isMuted) {
        if (isMuted && onEnd) {
          setTimeout(onEnd, 2000);
        } else {
          onEnd?.();
        }
        return;
      }

      // Reset cancelled flag before starting new speech
      isCancelledRef.current = false;
      setSpokenCharIndex(0); // Reset highlighting
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        v =>
          v.name.includes('Zira') ||      // Windows female
          v.name.includes('Samantha') ||  // macOS female
          v.name.includes('Google US English') || // Chrome female
          v.name.includes('Female') ||
          v.name.includes('Aria')         // Windows 11
      ) || voices.find(v => v.lang.startsWith('en'));
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      // Karaoke highlighting: track word boundaries as TTS speaks
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          setSpokenCharIndex(event.charIndex + event.charLength);
        }
      };

      // Only call onEnd if speech wasn't intentionally cancelled
      utterance.onend = () => {
        setSpokenCharIndex(text.length); // Highlight all when done
        if (!isCancelledRef.current) {
          onEnd?.();
        }
      };
      utterance.onerror = () => {
        if (!isCancelledRef.current) {
          onEnd?.();
        }
      };
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [speechSupported, isMuted]
  );

  // Play slide with auto-advance
  const playSlide = useCallback(
    (index: number, speed?: PlaybackSpeed) => {
      if (!videoLecture || index >= videoLecture.slides.length) {
        setIsPlaying(false);
        return;
      }

      setCurrentSlide(index);
      // Reset elapsed time when changing slides
      slideStartTimeRef.current = Date.now();
      setSlideElapsedTime(0);
      setShowQuizPopup(false);
      setQuizAnswered(false);

      const slide = videoLecture.slides[index];
      const useSpeed = speed ?? playbackSpeedRef.current;

      // For quiz slides, speak the teacher intro then show popup
      if (slide.isQuizSlide && slide.quiz) {
        const introText = slide.quiz.teacherIntro || slide.narration;
        speakText(introText, useSpeed, () => {
          // After intro, show quiz popup and pause
          setShowQuizPopup(true);
          setIsPlaying(false);
        });
      } else {
        // Normal slide - speak narration and auto-advance
        speakText(slide.narration, useSpeed, () => {
          if (isPlayingRef.current && index < videoLecture.slides.length - 1) {
            playSlide(index + 1);
          } else if (index >= videoLecture.slides.length - 1) {
            setIsPlaying(false);
          }
        });
      }
    },
    [videoLecture, speakText]
  );

  // Handle quiz answer - speak feedback then continue
  const handleQuizAnswer = useCallback(
    (correct: boolean, selectedIndex: number | null) => {
      setShowQuizPopup(false);
      setQuizAnswered(true);

      if (!videoLecture) return;

      const slide = videoLecture.slides[currentSlide];
      if (!slide?.quiz) return;

      // Speak teacher feedback
      const feedback = correct
        ? slide.quiz.correctFeedback
        : slide.quiz.wrongFeedback;

      speakText(feedback, playbackSpeedRef.current, () => {
        // After feedback, continue to next slide
        if (currentSlide < videoLecture.slides.length - 1) {
          setIsPlaying(true);
          playSlide(currentSlide + 1);
        } else {
          setIsPlaying(false);
        }
      });
    },
    [videoLecture, currentSlide, speakText, playSlide]
  );

  const generateWrittenLecture = async () => {
    if (!topic.trim() || isGeneratingWritten) return;

    setIsGeneratingWritten(true);
    setWrittenContent('');
    setCurrentLectureIdState(null);

    try {
      const response = await fetch('/api/generate-lecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          duration: `${duration}-${duration + 2}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate lecture');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk
            .split('\n')
            .filter(line => line.startsWith('data: '));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                setWrittenContent(prev => prev + data.chunk);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating lecture:', error);
      setWrittenContent('Failed to generate lecture. Please try again.');
    } finally {
      setIsGeneratingWritten(false);
    }
  };

  const generateVideoLecture = async () => {
    if (!topic.trim() || isGeneratingVideo) return;

    setIsGeneratingVideo(true);
    setVideoLecture(null);
    setCurrentSlide(0);
    setIsPlaying(false);
    setCurrentLectureIdState(null);

    try {
      const response = await fetch('/api/generate-video-lecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, duration }),
      });

      if (!response.ok) throw new Error('Failed to generate video lecture');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setVideoLecture(data);
    } catch (error) {
      console.error('Error generating video lecture:', error);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const togglePlayPause = () => {
    if (!videoLecture) return;

    if (isPlaying) {
      setIsPlaying(false);
      isCancelledRef.current = true; // Mark as intentionally cancelled
      window.speechSynthesis.cancel();
    } else {
      setIsPlaying(true);
      playSlide(currentSlide);
    }
  };

  const goToSlide = (index: number) => {
    if (!videoLecture) return;
    isCancelledRef.current = true; // Mark as intentionally cancelled
    window.speechSynthesis.cancel();
    setCurrentSlide(
      Math.max(0, Math.min(index, videoLecture.slides.length - 1))
    );
    setIsPlaying(false);
  };

  const cyclePlaybackSpeed = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    setPlaybackSpeed(newSpeed);
    playbackSpeedRef.current = newSpeed; // Update ref immediately

    if (isPlaying) {
      // Mark as intentionally cancelled to prevent slide advance
      isCancelledRef.current = true;
      window.speechSynthesis.cancel();
      const slide = videoLecture?.slides[currentSlide];
      if (slide) {
        // Use the new speed directly since state update is async
        setTimeout(() => {
          speakText(slide.narration, newSpeed, () => {
            if (
              isPlayingRef.current &&
              videoLecture &&
              currentSlide < videoLecture.slides.length - 1
            ) {
              playSlide(currentSlide + 1, newSpeed);
            } else {
              setIsPlaying(false);
            }
          });
        }, 100);
      }
    }
  };

  const copyContent = async () => {
    await navigator.clipboard.writeText(writtenContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([writtenContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}_lecture.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveCurrentWrittenLecture = async () => {
    if (!writtenContent.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const lecture = await saveWrittenLecture(topic, writtenContent);
      setCurrentLectureIdState(lecture.id);
      setCurrentLectureId(lecture.id);
      setSavedLectures(await getAllLectures());
      showSavedMessage('Lecture saved!');
    } finally {
      setIsSaving(false);
    }
  };

  const saveCurrentVideoLecture = async () => {
    if (!videoLecture || isSaving) return;

    setIsSaving(true);
    try {
      const lecture = await saveVideoLecture(topic, videoLecture);
      setCurrentLectureIdState(lecture.id);
      setCurrentLectureId(lecture.id);
      setSavedLectures(await getAllLectures());
      showSavedMessage('Video lecture saved!');
    } finally {
      setIsSaving(false);
    }
  };

  const showSavedMessage = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const goToQuiz = async (lectureId?: string) => {
    if (isQuizLoading) return;
    setIsQuizLoading(true);

    try {
      const id = lectureId || currentLectureIdState;
      if (id) {
        await setLectureForStudy(id);
        router.push('/quiz');
      } else if (writtenContent || videoLecture) {
        let savedId: string;
        if (activeTab === 'written' && writtenContent) {
          const lecture = await saveWrittenLecture(topic, writtenContent);
          savedId = lecture.id;
        } else if (activeTab === 'video' && videoLecture) {
          const lecture = await saveVideoLecture(topic, videoLecture);
          savedId = lecture.id;
        } else {
          return;
        }
        await setLectureForStudy(savedId);
        setSavedLectures(await getAllLectures());
        router.push('/quiz');
      }
    } finally {
      // setIsQuizLoading(false); // Can keep true until nav completes
    }
  };



  const loadSavedLecture = (lecture: SavedLecture) => {
    setSelectedLecture(lecture);
    setTopic(lecture.topic);
    setCurrentLectureIdState(lecture.id);
    setCurrentLectureId(lecture.id);

    if (lecture.type === 'written' && lecture.content) {
      setWrittenContent(lecture.content);
      setActiveTab('written');
    } else if (lecture.type === 'video' && lecture.videoData) {
      setVideoLecture(lecture.videoData);
      setCurrentSlide(0);
      setIsPlaying(false);
      setActiveTab('video');
    }
  };

  const handleDeleteLecture = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLectureToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteLecture = async () => {
    if (!lectureToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLecture(lectureToDelete);
      setSavedLectures(await getAllLectures());
      if (currentLectureIdState === lectureToDelete) {
        setCurrentLectureIdState(null);
      }
      if (selectedLecture?.id === lectureToDelete) {
        setSelectedLecture(null);
      }
      setShowDeleteModal(false);
      setLectureToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return (
      <>
        <main className={styles.main}>
          <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <p>Loading...</p>
          </div>
        </main>
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage />
      </>
    );
  }

  return (
    <>
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Hero Section - matches other pages */}
          <div className={styles.hero}>
            <h1>
              <span className={styles.heroGradient}>Lecture Generator</span>
            </h1>
            <p className={styles.heroText}>
              Generate comprehensive lectures on any topic instantly with AI
            </p>
          </div>

          {savedMessage && (
            <div className={styles.toast}>
              <Check size={16} />
              {savedMessage}
            </div>
          )}

          <div className={styles.tabs} style={{ animationDelay: '0.1s' }}>
            <button
              className={`${styles.tab} ${activeTab === 'written' ? styles.active : ''
                }`}
              onClick={() => setActiveTab('written')}
            >
              <FileText size={18} />
              Written Lecture
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'video' ? styles.active : ''
                }`}
              onClick={() => setActiveTab('video')}
            >
              <Video size={18} />
              Video Lecture
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'saved' ? styles.active : ''
                }`}
              onClick={() => setActiveTab('saved')}
            >
              <History size={18} />
              Saved ({savedLectures.length})
            </button>
          </div>

          {activeTab !== 'saved' && (
            <div className={styles.inputSection} style={{ animationDelay: '0.2s' }}>
              <div className={styles.inputGroup}>
                <label>Topic</label>
                <input
                  type="text"
                  placeholder="e.g., Quantum Computing Basics, Machine Learning Fundamentals..."
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className={styles.topicInput}
                />
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>
                    <Clock size={14} />
                    Duration
                  </label>
                  <CustomSelect
                    value={duration}
                    onChange={(value) => setDuration(Number(value))}
                    options={[
                      { value: 2, label: '2 minutes' },
                      { value: 3, label: '3 minutes' },
                      { value: 5, label: '5 minutes' },
                      { value: 7, label: '7 minutes' },
                      { value: 10, label: '10 minutes' },
                    ]}
                  />
                </div>

                <button
                  className={styles.generateBtn}
                  onClick={
                    activeTab === 'written'
                      ? generateWrittenLecture
                      : generateVideoLecture
                  }
                  disabled={
                    !topic.trim() ||
                    (activeTab === 'written'
                      ? isGeneratingWritten
                      : isGeneratingVideo)
                  }
                >
                  {(
                    activeTab === 'written'
                      ? isGeneratingWritten
                      : isGeneratingVideo
                  ) ? (
                    <>
                      <Loader2 size={18} className={styles.spin} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate {activeTab === 'written' ? 'Lecture' : 'Video'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'written' ? (
            <div className={`${styles.contentArea} ${styles.glassCard}`} style={{ animationDelay: '0.3s' }}>
              {writtenContent ? (
                <>
                  <div className={styles.contentActions}>
                    <button onClick={copyContent} className={styles.actionBtn}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={downloadMarkdown}
                      className={styles.actionBtn}
                    >
                      <Download size={16} />
                      Download MD
                    </button>
                    <button
                      onClick={saveCurrentWrittenLecture}
                      className={styles.actionBtn}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 size={16} className={styles.spin} /> : <Save size={16} />}
                      {currentLectureIdState ? 'Saved' : 'Save'}
                    </button>
                    <button
                      onClick={generateWrittenLecture}
                      className={styles.actionBtn}
                      disabled={isGeneratingWritten}
                    >
                      {isGeneratingWritten ? <Loader2 size={16} className={styles.spin} /> : <RefreshCw size={16} />}
                      Regenerate
                    </button>
                    <div className={styles.actionSpacer} />
                    <button
                      onClick={() => goToQuiz()}
                      className={`${styles.actionBtn} ${styles.studyBtn}`}
                      disabled={isQuizLoading}
                    >
                      {isQuizLoading ? <Loader2 size={16} className={styles.spin} /> : <FileQuestion size={16} />}
                      Take Quiz
                    </button>

                  </div>
                  <div className={styles.markdownContent}>
                    <InteractiveLecture content={writtenContent} />
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <FileText size={32} />
                  </div>
                  <h3>Generate a Written Lecture</h3>
                  <p>
                    Enter a topic and click generate to create a comprehensive
                    lecture in markdown format
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === 'video' ? (
            <div className={`${styles.contentArea} ${styles.glassCard}`} style={{ animationDelay: '0.3s' }}>
              {videoLecture ? (
                <div className={styles.videoPlayer}>
                  {/* Enhanced Video Presenter with transitions and 3D support */}
                  <VideoPresenter
                    slides={videoLecture.slides}
                    currentSlide={currentSlide}
                    isPlaying={isPlaying}
                    isMuted={isMuted}
                    elapsedTime={slideElapsedTime}
                    playbackSpeed={playbackSpeed}
                    spokenCharIndex={spokenCharIndex}
                    showQuizPopup={showQuizPopup}
                    onPlayPause={togglePlayPause}
                    onPrevSlide={() => goToSlide(currentSlide - 1)}
                    onNextSlide={() => goToSlide(currentSlide + 1)}
                    onToggleMute={() => setIsMuted(!isMuted)}
                    onSpeedChange={cyclePlaybackSpeed}
                    onSlideClick={goToSlide}
                    onQuizAnswer={handleQuizAnswer}
                    title={videoLecture.title}
                  />

                  <div className={styles.videoActions}>
                    <button
                      onClick={saveCurrentVideoLecture}
                      className={styles.actionBtn}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 size={16} className={styles.spin} /> : <Save size={16} />}
                      {currentLectureIdState ? 'Saved' : 'Save Lecture'}
                    </button>
                    <button
                      onClick={generateVideoLecture}
                      className={styles.actionBtn}
                      disabled={isGeneratingVideo}
                    >
                      {isGeneratingVideo ? <Loader2 size={16} className={styles.spin} /> : <RefreshCw size={16} />}
                      Regenerate
                    </button>
                    <div className={styles.actionSpacer} />
                    <button
                      onClick={() => goToQuiz()}
                      className={`${styles.actionBtn} ${styles.studyBtn}`}
                      disabled={isQuizLoading}
                    >
                      {isQuizLoading ? <Loader2 size={16} className={styles.spin} /> : <FileQuestion size={16} />}
                      Take Quiz
                    </button>

                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Video size={32} />
                  </div>
                  <h3>Generate a Video Lecture</h3>
                  <p>
                    Enter a topic and click generate to create an interactive
                    video presentation with AI narration
                  </p>
                  {!speechSupported && (
                    <p className={styles.warning}>
                      ⚠️ Your browser doesn&apos;t support speech synthesis.
                      Video will play without audio.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={`${styles.contentArea} ${styles.glassCard}`} style={{ animationDelay: '0.3s' }}>
              {savedLectures.length > 0 ? (
                <div className={styles.savedLecturesList}>
                  {savedLectures.map(lecture => (
                    <div
                      key={lecture.id}
                      className={`${styles.savedLectureCard} ${selectedLecture?.id === lecture.id
                        ? styles.selectedCard
                        : ''
                        }`}
                      onClick={() => loadSavedLecture(lecture)}
                    >
                      <div className={styles.lectureCardIcon}>
                        {lecture.type === 'written' ? (
                          <FileText size={20} />
                        ) : (
                          <Video size={20} />
                        )}
                      </div>
                      <div className={styles.lectureCardContent}>
                        <h4>{lecture.title}</h4>
                        <p className={styles.lectureTopic}>{lecture.topic}</p>
                        <div className={styles.lectureCardMeta}>
                          <span>{formatDate(lecture.createdAt)}</span>
                          {lecture.type === 'video' && lecture.videoData && (
                            <span>
                              • {lecture.videoData.slides.length} slides
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.lectureCardActions}>
                        <button
                          className={styles.cardActionBtn}
                          onClick={e => {
                            e.stopPropagation();
                            goToQuiz(lecture.id);
                          }}
                          title="Take Quiz"
                        >
                          <FileQuestion size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteLecture(lecture.id, e)}
                          className={`${styles.cardActionBtn} ${styles.deleteBtn}`}
                          title="Delete Lecture"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <History size={32} />
                  </div>
                  <h3>No Saved Lectures</h3>
                  <p>Generate lectures and save them to access them later</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* AI Voice Tutor */}
      {(videoLecture || writtenContent) && (
        <AITutor
          context={
            videoLecture
              ? `Slide ${currentSlide + 1}: ${videoLecture.slides[currentSlide]?.narration}`
              : writtenContent.slice(0, 5000)
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteLecture}
        title="Delete Lecture"
        message="Are you sure you want to delete this lecture? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Lecture'}
        isLoading={isDeleting}
        isDanger={true}
      />
    </>
  );
}
