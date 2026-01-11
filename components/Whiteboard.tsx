'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { DrawingInstruction, Point } from '@/lib/lectureStorage';
import styles from './Whiteboard.module.css';

// Easing functions for smoother animations
const easing = {
    linear: (t: number) => t,
    easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    elastic: (t: number) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    bounce: (t: number) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
};

interface WhiteboardProps {
    drawings: DrawingInstruction[];
    isPlaying: boolean;
    elapsedTime: number; // Time elapsed in current slide (seconds)
    slideKey: number | string; // Changes when slide changes to trigger canvas clear
}

export default function Whiteboard({
    drawings,
    isPlaying,
    elapsedTime,
    slideKey,
}: WhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastSlideKeyRef = useRef<number | string>(slideKey);

    // Clear canvas
    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#0f172a'; // Dark background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    // Draw a line with progress (0-1)
    const drawLine = (
        ctx: CanvasRenderingContext2D,
        points: Point[],
        progress: number,
        color: string,
        lineWidth: number
    ) => {
        if (points.length < 2) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        // Calculate how far along the line to draw based on progress
        const totalPoints = points.length - 1;
        const pointsToDraw = Math.floor(totalPoints * progress);
        const remainder = (totalPoints * progress) % 1;

        for (let i = 1; i <= pointsToDraw; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        // Interpolate to the partial next point
        if (pointsToDraw < totalPoints && remainder > 0) {
            const fromPoint = points[pointsToDraw];
            const toPoint = points[pointsToDraw + 1];
            const x = fromPoint.x + (toPoint.x - fromPoint.x) * remainder;
            const y = fromPoint.y + (toPoint.y - fromPoint.y) * remainder;
            ctx.lineTo(x, y);
        }

        ctx.stroke();
    };

    // Draw a circle with progress (0-1)
    const drawCircle = (
        ctx: CanvasRenderingContext2D,
        center: Point,
        radius: number,
        progress: number,
        color: string,
        lineWidth: number,
        fill?: boolean
    ) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2 * progress);
        if (fill && progress >= 1) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    };

    // Draw a rectangle with progress (0-1)
    const drawRectangle = (
        ctx: CanvasRenderingContext2D,
        start: Point,
        width: number,
        height: number,
        progress: number,
        color: string,
        lineWidth: number,
        fill?: boolean
    ) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = lineWidth;

        if (fill && progress >= 1) {
            ctx.fillRect(start.x, start.y, width, height);
        } else {
            // Draw perimeter progressively
            const perimeter = 2 * (width + height);
            const drawnLength = perimeter * progress;

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);

            let remaining = drawnLength;
            // Top edge
            if (remaining > 0) {
                const topDraw = Math.min(remaining, width);
                ctx.lineTo(start.x + topDraw, start.y);
                remaining -= topDraw;
            }
            // Right edge
            if (remaining > 0) {
                const rightDraw = Math.min(remaining, height);
                ctx.lineTo(start.x + width, start.y + rightDraw);
                remaining -= rightDraw;
            }
            // Bottom edge
            if (remaining > 0) {
                const bottomDraw = Math.min(remaining, width);
                ctx.lineTo(start.x + width - bottomDraw, start.y + height);
                remaining -= bottomDraw;
            }
            // Left edge
            if (remaining > 0) {
                const leftDraw = Math.min(remaining, height);
                ctx.lineTo(start.x, start.y + height - leftDraw);
            }
            ctx.stroke();
        }
    };

    // Draw an arrow with progress (0-1)
    const drawArrow = (
        ctx: CanvasRenderingContext2D,
        start: Point,
        end: Point,
        progress: number,
        color: string,
        lineWidth: number
    ) => {
        const currentEnd = {
            x: start.x + (end.x - start.x) * progress,
            y: start.y + (end.y - start.y) * progress,
        };

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';

        // Draw line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(currentEnd.x, currentEnd.y);
        ctx.stroke();

        // Draw arrowhead when almost complete
        if (progress > 0.8) {
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const headLength = 15;
            ctx.beginPath();
            ctx.moveTo(currentEnd.x, currentEnd.y);
            ctx.lineTo(
                currentEnd.x - headLength * Math.cos(angle - Math.PI / 6),
                currentEnd.y - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                currentEnd.x - headLength * Math.cos(angle + Math.PI / 6),
                currentEnd.y - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
        }
    };

    // Draw text with fade-in or handwriting effect
    const drawText = (
        ctx: CanvasRenderingContext2D,
        text: string,
        start: Point,
        fontSize: number,
        progress: number,
        color: string,
        handwriting?: boolean,
        glow?: boolean
    ) => {
        ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';

        // Apply glow effect
        if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
        }

        if (handwriting) {
            // Typewriter/handwriting effect - reveal characters progressively
            const charsToShow = Math.floor(text.length * easing.easeOut(progress));
            const visibleText = text.substring(0, charsToShow);
            ctx.globalAlpha = 1;
            ctx.fillText(visibleText, start.x, start.y);

            // Cursor blink effect
            if (progress < 1 && charsToShow < text.length) {
                const textWidth = ctx.measureText(visibleText).width;
                const cursorOpacity = Math.sin(Date.now() / 100) * 0.5 + 0.5;
                ctx.globalAlpha = cursorOpacity;
                ctx.fillRect(start.x + textWidth + 2, start.y, 2, fontSize);
            }
        } else {
            // Simple fade-in
            ctx.globalAlpha = easing.easeOut(progress);
            ctx.fillText(text, start.x, start.y);
        }

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    };

    // Draw polygon with progress
    const drawPolygon = (
        ctx: CanvasRenderingContext2D,
        points: Point[],
        progress: number,
        color: string,
        lineWidth: number,
        fill?: boolean
    ) => {
        if (points.length < 3) return;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        const edgesToDraw = Math.floor(points.length * progress);
        const remainder = (points.length * progress) % 1;

        for (let i = 1; i <= edgesToDraw && i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        // Partial edge
        if (edgesToDraw < points.length - 1 && remainder > 0) {
            const fromIdx = edgesToDraw;
            const toIdx = (edgesToDraw + 1) % points.length;
            const x = points[fromIdx].x + (points[toIdx].x - points[fromIdx].x) * remainder;
            const y = points[fromIdx].y + (points[toIdx].y - points[fromIdx].y) * remainder;
            ctx.lineTo(x, y);
        }

        if (fill && progress >= 1) {
            ctx.closePath();
            ctx.fill();
        } else {
            if (progress >= 1) ctx.closePath();
            ctx.stroke();
        }
    };

    // Draw a smooth curve through points
    const drawCurve = (
        ctx: CanvasRenderingContext2D,
        points: Point[],
        progress: number,
        color: string,
        lineWidth: number
    ) => {
        if (points.length < 2) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';

        const pointsToDraw = Math.ceil(points.length * progress);
        if (pointsToDraw < 2) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < pointsToDraw; i++) {
            const xc = (points[i - 1].x + points[i].x) / 2;
            const yc = (points[i - 1].y + points[i].y) / 2;
            ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
        }

        // Connect to the last point
        if (pointsToDraw > 1) {
            const last = points[pointsToDraw - 1];
            ctx.lineTo(last.x, last.y);
        }
        ctx.stroke();
    };

    // Draw all instructions based on elapsed time
    const renderFrame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear and redraw everything
        clearCanvas();

        // Sort drawings by timestamp
        const sortedDrawings = [...drawings].sort((a, b) => a.timestamp - b.timestamp);

        for (const drawing of sortedDrawings) {
            // Skip drawings that haven't started yet
            if (elapsedTime < drawing.timestamp) continue;

            // Calculate progress (0 to 1)
            const elapsed = elapsedTime - drawing.timestamp;
            const progress = Math.min(1, elapsed / Math.max(0.1, drawing.duration));

            switch (drawing.type) {
                case 'line':
                    if (drawing.points && drawing.points.length >= 2) {
                        drawLine(ctx, drawing.points, progress, drawing.color, drawing.lineWidth);
                    }
                    break;

                case 'circle':
                    if (drawing.start && drawing.radius) {
                        drawCircle(
                            ctx,
                            drawing.start,
                            drawing.radius,
                            progress,
                            drawing.color,
                            drawing.lineWidth,
                            drawing.fill
                        );
                    }
                    break;

                case 'rectangle':
                    if (drawing.start && drawing.width && drawing.height) {
                        drawRectangle(
                            ctx,
                            drawing.start,
                            drawing.width,
                            drawing.height,
                            progress,
                            drawing.color,
                            drawing.lineWidth,
                            drawing.fill
                        );
                    }
                    break;

                case 'arrow':
                    if (drawing.start && drawing.end) {
                        drawArrow(
                            ctx,
                            drawing.start,
                            drawing.end,
                            progress,
                            drawing.color,
                            drawing.lineWidth
                        );
                    }
                    break;

                case 'text':
                    if (drawing.text && drawing.start) {
                        drawText(
                            ctx,
                            drawing.text,
                            drawing.start,
                            drawing.fontSize || 20,
                            progress,
                            drawing.color,
                            drawing.handwriting,
                            drawing.glow
                        );
                    }
                    break;

                case 'polygon':
                    if (drawing.points && drawing.points.length >= 3) {
                        drawPolygon(
                            ctx,
                            drawing.points,
                            progress,
                            drawing.color,
                            drawing.lineWidth,
                            drawing.fill
                        );
                    }
                    break;

                case 'curve':
                    if (drawing.points && drawing.points.length >= 2) {
                        drawCurve(ctx, drawing.points, progress, drawing.color, drawing.lineWidth);
                    }
                    break;
            }
        }
    }, [drawings, elapsedTime, clearCanvas]);

    // Clear canvas when slide changes
    useEffect(() => {
        if (slideKey !== lastSlideKeyRef.current) {
            clearCanvas();
            lastSlideKeyRef.current = slideKey;
        }
    }, [slideKey, clearCanvas]);

    // Render frame whenever elapsed time changes or drawings update
    useEffect(() => {
        renderFrame();
    }, [renderFrame]);

    // Initial clear
    useEffect(() => {
        clearCanvas();
    }, [clearCanvas]);

    return (
        <div className={styles.whiteboardContainer}>
            <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className={styles.canvas}
            />
        </div>
    );
}
