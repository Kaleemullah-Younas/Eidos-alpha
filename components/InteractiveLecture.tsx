'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import EmbeddedQuiz, { parseQuizBlock, QuizQuestion } from './EmbeddedQuiz';
import styles from './InteractiveLecture.module.css';
import 'katex/dist/katex.min.css';

interface ContentBlock {
    type: 'markdown' | 'quiz';
    content: string;
    id: number;
    quiz?: QuizQuestion;
}

interface InteractiveLectureProps {
    content: string;
    onQuizAnswer?: (quizId: number, correct: boolean) => void;
}

// Parse content into blocks (markdown, quizzes, images)
function parseContentBlocks(content: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    let currentMarkdown = '';
    let blockId = 0;

    // Split by ::: blocks
    const regex = /:::(quiz|image)\n([\s\S]*?):::/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
        // Add markdown before this block
        const markdownBefore = content.slice(lastIndex, match.index).trim();
        if (markdownBefore) {
            blocks.push({
                type: 'markdown',
                content: markdownBefore,
                id: blockId++,
            });
        }

        const blockType = match[1] as 'quiz' | 'image';
        const blockContent = match[2].trim();

        if (blockType === 'quiz') {
            const quiz = parseQuizBlock(blockContent);
            if (quiz) {
                blocks.push({
                    type: 'quiz',
                    content: blockContent,
                    id: blockId++,
                    quiz,
                });
            }
        }
        // Skip image blocks - feature removed

        lastIndex = match.index + match[0].length;
    }

    // Add remaining markdown
    const remainingMarkdown = content.slice(lastIndex).trim();
    if (remainingMarkdown) {
        blocks.push({
            type: 'markdown',
            content: remainingMarkdown,
            id: blockId++,
        });
    }

    return blocks;
}

export default function InteractiveLecture({ content, onQuizAnswer }: InteractiveLectureProps) {
    const [answeredQuizzes, setAnsweredQuizzes] = useState<Set<number>>(new Set());
    const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const blocks = useMemo(() => parseContentBlocks(content), [content]);

    // Find the first unanswered quiz
    const firstUnansweredQuizIndex = useMemo(() => {
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].type === 'quiz' && !answeredQuizzes.has(blocks[i].id)) {
                return i;
            }
        }
        return null;
    }, [blocks, answeredQuizzes]);

    const handleQuizAnswer = useCallback((quizId: number, correct: boolean) => {
        setAnsweredQuizzes(prev => new Set([...prev, quizId]));
        onQuizAnswer?.(quizId, correct);
    }, [onQuizAnswer]);

    // Custom components for ReactMarkdown
    const markdownComponents = useMemo(() => ({
        // Enhanced code block rendering with syntax highlighting
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            if (!inline && language) {
                return (
                    <SyntaxHighlighter
                        style={oneDark}
                        language={language}
                        PreTag="div"
                        className={styles.codeBlock}
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                );
            }

            // Inline code
            return (
                <code className={styles.inlineCode} {...props}>
                    {children}
                </code>
            );
        },
        // Enhanced table rendering
        table({ children }: any) {
            return (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>{children}</table>
                </div>
            );
        },
        // Enhanced blockquote
        blockquote({ children }: any) {
            return <blockquote className={styles.blockquote}>{children}</blockquote>;
        },
        // Enhanced headings
        h1({ children }: any) {
            return <h1 className={styles.h1}>{children}</h1>;
        },
        h2({ children }: any) {
            return <h2 className={styles.h2}>{children}</h2>;
        },
        h3({ children }: any) {
            return <h3 className={styles.h3}>{children}</h3>;
        },
    }), []);

    return (
        <div ref={contentRef} className={styles.lectureContainer}>
            {blocks.map((block, index) => {
                const isBlocked = firstUnansweredQuizIndex !== null && index > firstUnansweredQuizIndex;

                return (
                    <div
                        key={block.id}
                        className={`${styles.contentBlock} ${isBlocked ? styles.blockedContent : ''}`}
                    >
                        {block.type === 'markdown' && (
                            <div className={styles.markdownBlock}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={markdownComponents}
                                >
                                    {block.content}
                                </ReactMarkdown>
                            </div>
                        )}

                        {block.type === 'quiz' && block.quiz && (
                            <EmbeddedQuiz
                                quiz={block.quiz}
                                onAnswered={(correct) => handleQuizAnswer(block.id, correct)}
                            />
                        )}

                        {isBlocked && (
                            <div className={styles.blockOverlay}>
                                <p>Answer the quiz above to continue reading</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
