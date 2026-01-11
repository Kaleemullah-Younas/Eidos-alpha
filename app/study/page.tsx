'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/components/AuthProvider';
import {
  getSessionById,
  getAllSessions,
  type StudySession,
} from '@/lib/studyStorage';
import {
  getChatHistoryAction,
  saveChatMessageAction,
  type ChatMessage,
} from '@/app/actions/chat';
import {
  BookOpen,
  Brain,
  GraduationCap,
  User,
  Bot,
  Send,
  Lightbulb,
} from 'lucide-react';
import styles from './study.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function StudyPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();

  const [session, setSession] = useState<StudySession | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessionId || ''
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load sessions on mount
  // Load sessions on mount
  useEffect(() => {
    async function load() {
      try {
        const allSessions = await getAllSessions();
        setSessions(allSessions);

        if (sessionId) {
          const s = await getSessionById(sessionId);
          setSession(s);
          // Load chat history from DB
          const history = await getChatHistoryAction(sessionId);
          setMessages(history);
        } else if (allSessions.length > 0) {
          setSelectedSessionId(allSessions[0].id);
          setSession(allSessions[0]);
          // Load chat history from DB
          const history = await getChatHistoryAction(allSessions[0].id);
          setMessages(history);
        }
      } finally {
        setSessionsLoading(false);
      }
    }
    load();
  }, [sessionId]);

  // Update session when selection changes (only when different from initial)
  useEffect(() => {
    async function changeSession() {
      if (selectedSessionId && selectedSessionId !== sessionId) {
        const s = await getSessionById(selectedSessionId);
        setSession(s);
        // Load chat history from DB
        const history = await getChatHistoryAction(selectedSessionId);
        setMessages(history);
      }
    }
    changeSession();
  }, [selectedSessionId, sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const getContext = () => {
    if (!session) return '';

    // Combine all materials from the session
    const materials = session.materials.map(m => m.content).join('\n\n---\n\n');
    return materials;
  };

  const askQuestion = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');

    // Add user message
    // Generate temp ID for UI, save to DB in background
    const tempId = crypto.randomUUID();
    const userMessage: Message = {
      id: tempId,
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Save user message to DB
    if (selectedSessionId) {
      saveChatMessageAction(selectedSessionId, 'user', question);
    }

    setIsLoading(true);
    setStreamingText('');

    try {
      const context = getContext();

      // Build conversation history for memory (last 10 messages)
      const conversationHistory = updatedMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context,
          conversationHistory,
          enableSearch: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk
            .split('\n')
            .filter(line => line.startsWith('data: '));

          for (const line of lines) {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.chunk) {
              fullAnswer += data.chunk;
              setStreamingText(fullAnswer);
            }

            if (data.done) {
              // Add assistant message
              const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: fullAnswer,
                timestamp: new Date(),
              };
              setMessages(prev => {
                const newMessages = [...prev, assistantMessage];
                return newMessages;
              });

              // Save assistant message to DB
              if (selectedSessionId) {
                saveChatMessageAction(selectedSessionId, 'assistant', fullAnswer);
              }

              setStreamingText('');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error asking question:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${(error as Error).message} `,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const suggestedQuestions = [
    'Explain the main concepts in simple terms',
    'What are the key takeaways?',
    'Can you give me real-world examples?',
    'What are common misconceptions about this topic?',
    'How does this connect to other topics?',
    'Create a summary I can review quickly',
  ];

  if (authLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p>Loading...</p>
        </div>
      </main>
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
    <main className={styles.main}>
      {/* Hero Section - matches other pages */}

      <div className={styles.container}>
        <div className={styles.sidebar} style={{ animationDelay: '0.1s' }}>
          <h2 className={styles.sidebarTitle}>
            <BookOpen size={20} />
            Study Sessions
          </h2>

          <div className={styles.sessionList}>
            {sessionsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className={styles.sessionItem} style={{ opacity: 0.5, animation: 'pulse 1.5s infinite', height: '60px' }}></div>
              ))
            ) : sessions.length === 0 ? (
              <p className={styles.empty}>No study sessions yet</p>
            ) : (
              sessions.map(s => (
                <button
                  key={s.id}
                  className={`${styles.sessionItem} ${s.id === selectedSessionId ? styles.active : ''
                    } `}
                  onClick={() => setSelectedSessionId(s.id)}
                >
                  <span className={styles.sessionTitle}>{s.title}</span>
                  <span className={styles.sessionDate}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className={styles.sidebarInfo}>
            <p>
              <Lightbulb size={14} />
              Select a session to study
            </p>
          </div>
        </div>

        <div className={styles.chatArea} style={{ animationDelay: '0.2s' }}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderTitle}>
              <Brain size={24} />
              <h1>Smart Study Mode</h1>
            </div>
            {session && (
              <p className={styles.sessionContext}>
                Studying: <strong>{session.title}</strong>
              </p>
            )}
          </div>

          <div className={styles.messagesContainer}>
            {messages.length === 0 && !streamingText ? (
              <div className={styles.welcomeState}>
                {/* Icon removed from welcome state as requested */}
                <h2>Ask me anything about your study material!</h2>
                <p>
                  I can explain concepts, provide examples, and help you
                  understand better.
                </p>

                <div className={styles.suggestedQuestions}>
                  <p>Try asking:</p>
                  <div className={styles.suggestions}>
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        className={styles.suggestionBtn}
                        onClick={() => setInput(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.messages}>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`${styles.message} ${styles[msg.role]} `}
                  >
                    <div className={styles.messageAvatar}>
                      {msg.role === 'user' ? (
                        user?.image ? (
                          <img src={user.image} alt="" className={styles.userImage} />
                        ) : (
                          <User size={20} />
                        )
                      ) : (
                        <Bot size={20} />
                      )}
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageText}>
                        {msg.role === 'assistant' ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : (
                          msg.content
                            .split('\n')
                            .map((line, i) => <p key={i}>{line}</p>)
                        )}
                      </div>
                      <span className={styles.messageTime}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}

                {streamingText && (
                  <div className={`${styles.message} ${styles.assistant} `}>
                    <div className={styles.messageAvatar}>
                      <Bot size={20} />
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageText}>
                        <MarkdownRenderer content={streamingText} />
                        <span className={styles.cursor}>▋</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  session
                    ? 'Ask a question about your study material...'
                    : 'Select a study session to start...'
                }
                className={styles.input}
                disabled={!session || isLoading}
                rows={1}
              />
              <button
                onClick={askQuestion}
                disabled={!input.trim() || !session || isLoading}
                className={styles.sendBtn}
              >
                {isLoading ? (
                  <span className={styles.loadingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            <p className={styles.hint}>
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
