'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only on mouse/trackpad - skip touch screens
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        if (isTouch) return;

        const body = document.body;
        body.classList.add('custom-cursor-active');

        let x = -100, y = -100;
        let rafId: number;

        function onMove(e: MouseEvent) {
            x = e.clientX;
            y = e.clientY;
        }

        function onDown() { body.classList.add('cursor-click'); }
        function onUp()   { body.classList.remove('cursor-click'); }

        function onOver(e: MouseEvent) {
            if ((e.target as Element).closest('a, button, [role="button"], input, textarea, select, label')) {
                body.classList.add('cursor-hover');
            }
        }
        function onOut(e: MouseEvent) {
            if ((e.target as Element).closest('a, button, [role="button"], input, textarea, select, label')) {
                body.classList.remove('cursor-hover');
            }
        }

        function tick() {
            if (cursorRef.current) {
                cursorRef.current.style.left = x + 'px';
                cursorRef.current.style.top  = y + 'px';
            }
            rafId = requestAnimationFrame(tick);
        }

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mouseover', onOver);
        window.addEventListener('mouseout', onOut);
        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mouseover', onOver);
            window.removeEventListener('mouseout', onOut);
            body.classList.remove('custom-cursor-active', 'cursor-hover', 'cursor-click');
        };
    }, []);

    return (
        <div ref={cursorRef} className="c-cursor" aria-hidden="true">
            {/*
              Triangle cursor: tip at top-left, right edge diagonal.
              Rounded corners via quadratic bezier at each vertex.
              viewBox 0 0 18 22 - rendered at 15×18px in CSS.

              Vertices (with 1-unit rounding):
                A=(2,2)  → tip
                B=(2,17) → bottom-left
                C=(12,12) → bottom-right

              Circle center at midpoint of BC = (7, 14.5), r=3.5
              positioned half inside / half outside the base edge.
            */}
            <svg className="c-tri" viewBox="0 0 14 18" xmlns="http://www.w3.org/2000/svg">
                {/*
                  Clean arrow cursor: tip A=(2,2), base-left B=(2,16), right C=(12,9).
                  Each corner rounded with Q-bezier (r≈1.5–2 units):
                    Tip A:        enter from C side → Q at (2,2)  → exit toward B
                    Bottom B:     enter from A      → Q at (2,16) → exit toward C
                    Right C:      enter from B      → Q at (12,9) → exit toward A
                */}
                <path
                    d="M 3.2,2.9 Q 2,2 2,3.5 L 2,14 Q 2,16 3.6,14.9 L 10.8,9.9 Q 12,9 10.8,8.1 Z"
                    className="c-tri-body"
                />
                {/* Jade accent dot at midpoint of the base edge */}
                <circle cx="7" cy="12.5" r="2.3" className="c-tri-dot" />
            </svg>
        </div>
    );
}

