'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './MarkdownRenderer.module.css';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const markdownComponents = useMemo(() => ({
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

            return (
                <code className={styles.inlineCode} {...props}>
                    {children}
                </code>
            );
        },
        table({ children }: any) {
            return (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>{children}</table>
                </div>
            );
        },
        blockquote({ children }: any) {
            return <blockquote className={styles.blockquote}>{children}</blockquote>;
        },
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
        <div className={styles.markdownContainer}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
