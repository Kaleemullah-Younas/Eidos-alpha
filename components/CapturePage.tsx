'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import styles from './CapturePage.module.css';
import ConfirmationModal from '@/components/ConfirmationModal';
import {
  createStudySession,
  addMaterialToSession,
  setCurrentSessionId,
} from '@/lib/studyStorage';
import {
  saveCapture,
  getAllCaptures,
  deleteCapture,
  setCaptureForStudy,
  setCurrentCaptureId,
  formatDuration,
  type SavedCapture,
} from '@/lib/captureStorage';
import {
  Video,
  Camera,
  Mic,
  Bot,
  Clapperboard,
  Square,
  Sparkles,
  Loader2,
  FileText,
  Download,
  Lightbulb,
  BarChart3,
  Check,
  FileQuestion,
  Save,
  History,
  Trash2,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionType = any;

export default function CapturePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'capture' | 'saved'>('capture');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [studySessionId, setStudySessionId] = useState<string | null>(null);
  const [status, setStatus] = useState('Ready to capture your lecture');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');

  // Saved captures state
  const [savedCaptures, setSavedCaptures] = useState<SavedCapture[]>([]);
  const [selectedCapture, setSelectedCapture] = useState<SavedCapture | null>(
    null
  );
  const [savedMessage, setSavedMessage] = useState('');
  const [currentCaptureIdState, setCurrentCaptureIdState] = useState<
    string | null
  >(null);
  const [captureTitle, setCaptureTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [captureToDelete, setCaptureToDelete] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const currentTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const finalRecordingTimeRef = useRef<number>(0);
  const finalFrameCountRef = useRef<number>(0);

  useEffect(() => {
    // Initialize speech recognition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowAny = window as any;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass =
        windowAny.webkitSpeechRecognition || windowAny.SpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: {
        results: {
          length: number;
          [index: number]: {
            [index: number]: { transcript: string };
            isFinal: boolean;
          };
        };
      }) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        currentTranscriptRef.current = fullTranscript;
        setLiveTranscript(fullTranscript);
      };

      recognition.onerror = (event: { error: string }) => {
        console.log('Speech recognition error:', event.error);
        // Restart recognition on recoverable errors
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          if (isRecordingRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Already started, ignore
            }
          }
        }
      };

      recognition.onend = () => {
        // Auto-restart if still recording
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started, ignore
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Load saved captures
  useEffect(() => {
    async function load() {
      setSavedCaptures(await getAllCaptures());
    }
    load();
  }, []);

  const captureFrame = useCallback(async (currentSessionId: string) => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob(
        async blob => {
          if (!blob) return;

          const formData = new FormData();
          formData.append('frame', blob, 'frame.jpg');
          formData.append('sessionId', currentSessionId);
          formData.append('timestamp', Date.now().toString());
          formData.append('transcript', currentTranscriptRef.current);

          try {
            await fetch('/api/recording/upload', {
              method: 'POST',
              body: formData,
            });
            setFrameCount(prev => prev + 1);
          } catch (error) {
            console.error('Error uploading frame:', error);
          }
        },
        'image/jpeg',
        0.8
      );
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  }, []);

  const startRecording = async () => {
    try {
      // Start a new session
      const response = await fetch('/api/recording/start', { method: 'POST' });
      const data = await response.json();
      const newSessionId = data.sessionId;
      setSessionId(newSessionId);

      // Get camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Start capturing frames
      captureIntervalRef.current = setInterval(() => {
        captureFrame(newSessionId);
      }, 5000);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      isRecordingRef.current = true;
      setIsRecording(true);
      setStatus('Recording in progress... Capturing frames every 5 seconds');
      setNotes('');
      setFrameCount(0);
      setRecordingTime(0);
      setLiveTranscript('');
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus(
        'Error accessing camera. Please ensure camera permissions are granted.'
      );
    }
  };

  const stopRecording = async () => {
    // Mark recording as stopped first to prevent speech recognition restart
    isRecordingRef.current = false;

    // Stop capturing
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Call recording/end for logging
    if (sessionId) {
      try {
        await fetch('/api/recording/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
      } catch (error) {
        console.error('Error calling recording/end:', error);
      }
    }

    // Save final values for later use when saving
    finalRecordingTimeRef.current = recordingTime;
    finalFrameCountRef.current = frameCount;

    // Reset current capture state for new recordings
    setCurrentCaptureIdState(null);
    setCaptureTitle('');

    setIsRecording(false);
    setStatus(
      `Recording stopped. Captured ${frameCount} frames. Ready to generate notes!`
    );
  };

  const generateNotes = async () => {
    if (!sessionId) return;

    setIsGenerating(true);
    setStreamingText('');
    setStatus('Analyzing captured content with Gemini AI...');

    try {
      const response = await fetch('/api/generate-notes-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate notes');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
      }

      const decoder = new TextDecoder();
      let fullNotes = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.chunk) {
                fullNotes += data.chunk;
                setStreamingText(fullNotes);
                setStatus('Generating notes in real-time...');
              }

              if (data.done && data.notes) {
                fullNotes = data.notes;
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      if (fullNotes) {
        setNotes(fullNotes);
        setStreamingText('');

        // Save to localStorage for quiz generation
        localStorage.setItem('eidos.studyText', fullNotes);

        // Create a study session and save the material
        const studySession = await createStudySession(
          `Lecture - ${new Date().toLocaleDateString()}`
        );
        await addMaterialToSession(studySession.id, {
          type: 'capture',
          title: `Lecture Capture`,
          content: fullNotes,
          sourceType: 'video',
        });
        setCurrentSessionId(studySession.id);
        setStudySessionId(studySession.id);

        setStatus(
          'Notes generated and saved! You can now create quizzes.'
        );
      } else {
        setStatus('No notes received from AI. Try recording again.');
      }
    } catch (error) {
      console.error('Error generating notes:', error);
      setStatus('Error generating notes. Check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadNotes = async () => {
    if (!notes || !sessionId) return;

    setStatus('Preparing download...');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, sessionId }),
      });

      const data = await response.json();

      if (data.markdownUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = data.markdownUrl;
        link.download = data.markdownUrl.split('/').pop() || 'notes.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setStatus('Notes downloaded successfully!');
      }
    } catch {
      setStatus('Error downloading notes. Try again.');
    }
  };

  const saveCurrentCapture = async () => {
    if (!notes.trim()) return;

    const title =
      captureTitle.trim() ||
      `Lecture - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const capture = await saveCapture(
      title,
      notes,
      liveTranscript || currentTranscriptRef.current,
      finalRecordingTimeRef.current || recordingTime,
      finalFrameCountRef.current || frameCount
    );

    setCurrentCaptureIdState(capture.id);
    setCurrentCaptureId(capture.id);
    setSavedCaptures(await getAllCaptures());
    showSavedMessage('Capture saved!');
  };

  const showSavedMessage = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleDeleteCapture = (id: string) => {
    setCaptureToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteCapture = async () => {
    if (!captureToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCapture(captureToDelete);
      setSavedCaptures(await getAllCaptures());
      if (selectedCapture?.id === captureToDelete) {
        setSelectedCapture(null);
      }
      if (currentCaptureIdState === captureToDelete) {
        setCurrentCaptureIdState(null);
      }
      setShowDeleteModal(false);
      setCaptureToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const loadSavedCapture = (capture: SavedCapture) => {
    setSelectedCapture(capture);
    setNotes(capture.notes);
    setCurrentCaptureIdState(capture.id);
    setCaptureTitle(capture.title);
    finalRecordingTimeRef.current = capture.duration;
    finalFrameCountRef.current = capture.frameCount;
    setActiveTab('capture');
  };

  const goToQuiz = async (captureId?: string) => {
    const id = captureId || currentCaptureIdState;
    if (id) {
      await setCaptureForStudy(id);
      router.push('/quiz');
    } else if (notes) {
      // Save first if not saved
      const title =
        captureTitle.trim() ||
        `Lecture - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      const capture = await saveCapture(
        title,
        notes,
        liveTranscript || currentTranscriptRef.current,
        finalRecordingTimeRef.current || recordingTime,
        finalFrameCountRef.current || frameCount
      );
      await setCaptureForStudy(capture.id);
      setSavedCaptures(await getAllCaptures());
      router.push('/quiz');
    }
  };

  // Flashcards feature removed

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.hero}>
          <h1>
            <span className={styles.heroGradient}>Lecture</span> Capture Studio
          </h1>
          <p className={styles.heroText}>
            Record your classroom, capture the whiteboard, and let AI transform
            it into comprehensive study notes.
          </p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'capture' ? styles.activeTab : ''
              }`}
            onClick={() => setActiveTab('capture')}
          >
            <Video size={18} />
            Capture
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'saved' ? styles.activeTab : ''
              }`}
            onClick={() => setActiveTab('saved')}
          >
            <History size={18} />
            Saved ({savedCaptures.length})
          </button>
        </div>

        {/* Saved message toast */}
        {savedMessage && (
          <div className={styles.savedToast}>
            <Check size={16} />
            {savedMessage}
          </div>
        )}

        {activeTab === 'capture' ? (
          <div className={styles.mainGrid}>
            <div className={styles.videoSection}>
              <div className={styles.videoHeader}>
                <div className={styles.videoLabel}>
                  <Video size={16} />
                  Camera Feed
                </div>
                <div
                  className={`${styles.statusIndicator} ${isRecording ? styles.recording : ''
                    }`}
                >
                  <span className={styles.statusDot}></span>
                  {isRecording ? 'Recording' : 'Standby'}
                </div>
              </div>

              <div className={styles.videoWrapper}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={styles.video}
                />

                {!isRecording && !streamRef.current && (
                  <div className={styles.placeholder}>
                    <div className={styles.placeholderIcon}>
                      <Clapperboard size={40} />
                    </div>
                    <div className={styles.placeholderText}>
                      <h3>Ready to Record</h3>
                      <p>
                        Click Start Recording to begin capturing your lecture
                      </p>
                    </div>
                    <div className={styles.placeholderFeatures}>
                      <div className={styles.placeholderFeature}>
                        <Camera size={16} />
                        Video capture
                      </div>
                      <div className={styles.placeholderFeature}>
                        <Mic size={16} />
                        Speech recognition
                      </div>
                      <div className={styles.placeholderFeature}>
                        <Bot size={16} />
                        AI analysis
                      </div>
                    </div>
                  </div>
                )}

                {isRecording && (
                  <>
                    <div className={styles.recordingOverlay}></div>
                    <div className={styles.recordingBadge}>
                      <span className={styles.recordingBadgeDot}></span>
                      <span className={styles.recordingBadgeText}>
                        REC {formatTime(recordingTime)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.controls}>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className={`${styles.controlBtn} ${styles.startBtn}`}
                  >
                    <Video size={18} />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className={`${styles.controlBtn} ${styles.stopBtn}`}
                  >
                    <Square size={18} />
                    Stop Recording
                  </button>
                )}

                {sessionId && !isRecording && !notes && (
                  <button
                    onClick={generateNotes}
                    disabled={isGenerating}
                    className={`${styles.controlBtn} ${styles.generateBtn}`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className={styles.spin} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate Notes
                      </>
                    )}
                  </button>
                )}

                {notes && (
                  <button
                    onClick={downloadNotes}
                    className={`${styles.controlBtn} ${styles.downloadBtn}`}
                  >
                    <Download size={18} />
                    Download Markdown
                  </button>
                )}
              </div>

              <div className={styles.statusBar}>
                <div className={styles.statusIcon}>
                  {isGenerating ? (
                    <Bot size={20} />
                  ) : isRecording ? (
                    <Video size={20} />
                  ) : notes ? (
                    <Check size={20} />
                  ) : (
                    <Lightbulb size={20} />
                  )}
                </div>
                <div className={styles.statusContent}>
                  <p className={styles.statusLabel}>Status</p>
                  <p className={styles.statusText}>{status}</p>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.statsCard}>
                <div className={styles.statsHeader}>
                  <div className={styles.statsIcon}>
                    <BarChart3 size={18} />
                  </div>
                  <h3>Session Stats</h3>
                </div>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <p className={styles.statValue}>
                      {formatTime(recordingTime)}
                    </p>
                    <p className={styles.statLabel}>Duration</p>
                  </div>
                  <div className={styles.statItem}>
                    <p className={styles.statValue}>{frameCount}</p>
                    <p className={styles.statLabel}>Frames</p>
                  </div>
                </div>
              </div>

              {isRecording && (
                <div className={styles.transcriptCard}>
                  <div className={styles.transcriptHeader}>
                    <div className={styles.transcriptIcon}>
                      <Mic size={18} />
                    </div>
                    <h3>Live Transcript</h3>
                    <span className={styles.liveBadge}>● Live</span>
                  </div>
                  <div className={styles.transcriptContent}>
                    {liveTranscript || (
                      <span className={styles.transcriptPlaceholder}>
                        Listening... Start speaking to see your words here.
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.tipsCard}>
                <div className={styles.tipsHeader}>
                  <div className={styles.tipsIcon}>
                    <Lightbulb size={18} />
                  </div>
                  <h3>Quick Tips</h3>
                </div>
                <ul className={styles.tipsList}>
                  <li className={styles.tipItem}>
                    <span className={styles.tipNumber}>1</span>
                    <span className={styles.tipText}>
                      <strong>Position camera</strong> to clearly see the board
                    </span>
                  </li>
                  <li className={styles.tipItem}>
                    <span className={styles.tipNumber}>2</span>
                    <span className={styles.tipText}>
                      Frames captured <strong>every 5 seconds</strong>
                    </span>
                  </li>
                  <li className={styles.tipItem}>
                    <span className={styles.tipNumber}>3</span>
                    <span className={styles.tipText}>
                      <strong>Speak clearly</strong> for better transcription
                    </span>
                  </li>
                  <li className={styles.tipItem}>
                    <span className={styles.tipNumber}>4</span>
                    <span className={styles.tipText}>
                      Click stop when <strong>lecture ends</strong>
                    </span>
                  </li>
                </ul>
              </div>

              <div className={styles.shortcutsCard}>
                <p className={styles.shortcutsTitle}>Features</p>
                <div className={styles.shortcutsList}>
                  <div className={styles.shortcutItem}>
                    <span className={styles.shortcutLabel}>Visual capture</span>
                    <span className={styles.shortcutKey}>1080p</span>
                  </div>
                  <div className={styles.shortcutItem}>
                    <span className={styles.shortcutLabel}>Speech-to-text</span>
                    <span className={styles.shortcutKey}>Live</span>
                  </div>
                  <div className={styles.shortcutItem}>
                    <span className={styles.shortcutLabel}>AI Analysis</span>
                    <span className={styles.shortcutKey}>Gemini</span>
                  </div>
                </div>
              </div>
            </div>

            {(notes || streamingText) && (
              <div className={styles.notesSection}>
                <div className={styles.notesHeader}>
                  <div className={styles.notesTitle}>
                    <FileText size={20} />
                    <h2>Generated Notes</h2>
                    {isGenerating && (
                      <span className={styles.liveBadge}>● Live</span>
                    )}
                    {currentCaptureIdState && (
                      <span className={styles.savedBadge}>
                        <Check size={14} />
                        Saved
                      </span>
                    )}
                  </div>
                  <div className={styles.notesActions}>
                    {notes && (
                      <>
                        <button
                          onClick={() => goToQuiz()}
                          className={`${styles.controlBtn} ${styles.generateBtn}`}
                        >
                          <FileQuestion size={18} />
                          Create Quiz
                        </button>
                        {/* Flashcards button removed */}
                        <button
                          onClick={saveCurrentCapture}
                          disabled={!!currentCaptureIdState}
                          className={`${styles.controlBtn} ${styles.saveBtn}`}
                        >
                          <Save size={18} />
                          {currentCaptureIdState ? 'Saved' : 'Save'}
                        </button>
                        <button
                          onClick={downloadNotes}
                          className={`${styles.controlBtn} ${styles.downloadBtn}`}
                        >
                          <Download size={18} />
                          Download
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Title input for saving */}
                {notes && !currentCaptureIdState && (
                  <div className={styles.titleInput}>
                    <label htmlFor="captureTitle">Title (optional)</label>
                    <input
                      id="captureTitle"
                      type="text"
                      value={captureTitle}
                      onChange={e => setCaptureTitle(e.target.value)}
                      placeholder={`Lecture - ${new Date().toLocaleDateString()}`}
                    />
                  </div>
                )}

                <div className={styles.notesContent}>
                  <MarkdownRenderer content={streamingText || notes} />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Saved Captures Tab */
          <div className={styles.savedSection}>
            {savedCaptures.length === 0 ? (
              <div className={styles.emptyState}>
                <History size={48} />
                <h3>No Saved Captures</h3>
                <p>
                  Record and generate notes, then save them to see them here.
                </p>
                <button
                  className={`${styles.controlBtn} ${styles.generateBtn}`}
                  onClick={() => setActiveTab('capture')}
                >
                  <Video size={18} />
                  Start Capturing
                </button>
              </div>
            ) : (
              <div className={styles.savedList}>
                {savedCaptures.map(capture => (
                  <div
                    key={capture.id}
                    className={`${styles.savedItem} ${selectedCapture?.id === capture.id
                      ? styles.selectedItem
                      : ''
                      }`}
                  >
                    <div
                      className={styles.savedItemContent}
                      onClick={() => loadSavedCapture(capture)}
                    >
                      <div className={styles.savedItemHeader}>
                        <Video size={18} />
                        <h3>{capture.title}</h3>
                      </div>
                      <div className={styles.savedItemMeta}>
                        <span>{capture.createdAt.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{formatDuration(capture.duration)}</span>
                        <span>•</span>
                        <span>{capture.frameCount} frames</span>
                      </div>
                      <p className={styles.savedItemPreview}>
                        {capture.notes.slice(0, 150)}...
                      </p>
                    </div>
                    <div className={styles.savedItemActions}>
                      <button
                        onClick={() => goToQuiz(capture.id)}
                        className={styles.iconBtn}
                        title="Create Quiz"
                      >
                        <FileQuestion size={16} />
                      </button>
                      {/* Flashcards action removed */}
                      <button
                        onClick={() => handleDeleteCapture(capture.id)}
                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteCapture}
        title="Delete Capture"
        message="Are you sure you want to delete this capture? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Capture'}
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
}
