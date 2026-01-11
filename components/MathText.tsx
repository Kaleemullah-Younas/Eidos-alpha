'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
    text: string;
    className?: string;
}

/**
 * MathText component renders text with LaTeX math expressions.
 * Supports both inline ($...$) and block ($$...$$) math.
 */
export default function MathText({ text, className }: MathTextProps) {
    const renderedContent = useMemo(() => {
        if (!text) return '';

        // Split by math delimiters while preserving them
        // Handle both block ($$...$$) and inline ($...$) math
        const parts: { type: 'text' | 'math-inline' | 'math-block'; content: string }[] = [];
        let remaining = text;

        // Pattern to match $$...$$ (block) or $...$ (inline) 
        // Block math pattern: $$...$$
        // Inline math pattern: $...$ (but not $$)
        const mathPattern = /(\$\$[\s\S]*?\$\$|\$(?!\$)[^\$\n]*?\$)/g;

        let lastIndex = 0;
        let match;

        while ((match = mathPattern.exec(remaining)) !== null) {
            // Add text before this match
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: remaining.slice(lastIndex, match.index)
                });
            }

            const mathStr = match[0];
            if (mathStr.startsWith('$$')) {
                parts.push({
                    type: 'math-block',
                    content: mathStr.slice(2, -2) // Remove $$ delimiters
                });
            } else {
                parts.push({
                    type: 'math-inline',
                    content: mathStr.slice(1, -1) // Remove $ delimiters
                });
            }

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < remaining.length) {
            parts.push({
                type: 'text',
                content: remaining.slice(lastIndex)
            });
        }

        return parts;
    }, [text]);

    if (!text) return null;

    // If no math found, just return plain text
    if (typeof renderedContent === 'string' || renderedContent.length === 0) {
        return <span className={className}>{text}</span>;
    }

    // Check if there's any math content
    const hasMath = renderedContent.some(p => p.type !== 'text');
    if (!hasMath) {
        return <span className={className}>{text}</span>;
    }

    return (
        <span className={className}>
            {renderedContent.map((part, index) => {
                if (part.type === 'text') {
                    return <span key={index}>{part.content}</span>;
                }

                try {
                    const html = katex.renderToString(part.content, {
                        throwOnError: false,
                        displayMode: part.type === 'math-block',
                        output: 'html',
                    });

                    if (part.type === 'math-block') {
                        return (
                            <span
                                key={index}
                                dangerouslySetInnerHTML={{ __html: html }}
                                style={{ display: 'block', textAlign: 'center', margin: '0.5em 0' }}
                            />
                        );
                    }

                    return (
                        <span
                            key={index}
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    );
                } catch {
                    // If KaTeX fails, show original text
                    return <span key={index}>{part.type === 'math-block' ? `$$${part.content}$$` : `$${part.content}$`}</span>;
                }
            })}
        </span>
    );
}
