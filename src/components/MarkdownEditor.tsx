'use client';
import { useRef, useState, useCallback } from 'react';
import { MarkdownContent } from './MarkdownContent';

interface Props {
    name: string;
    defaultValue?: string;
    placeholder?: string;
    minHeight?: number;
    required?: boolean;
}

type ToolbarItem =
    | { type: 'wrap'; label: string; title: string; before: string; after: string; icon: string }
    | { type: 'line'; label: string; title: string; prefix: string; icon: string }
    | { type: 'insert'; label: string; title: string; text: string; icon: string }
    | { type: 'sep' };

const TOOLBAR: ToolbarItem[] = [
    { type: 'wrap',   label: 'B',  title: 'Bold',            before: '**',  after: '**',  icon: '𝗕'  },
    { type: 'wrap',   label: 'I',  title: 'Italic',          before: '*',   after: '*',   icon: '𝘐'  },
    { type: 'wrap',   label: '`',  title: 'Inline code',     before: '`',   after: '`',   icon: '`'  },
    { type: 'sep' },
    { type: 'line',   label: 'h1', title: 'Heading 1',       prefix: '# ',  icon: 'H1' },
    { type: 'line',   label: 'h2', title: 'Heading 2',       prefix: '## ', icon: 'H2' },
    { type: 'line',   label: 'h3', title: 'Heading 3',       prefix: '### ',icon: 'H3' },
    { type: 'sep' },
    { type: 'line',   label: 'ul', title: 'Bullet list',     prefix: '- ',  icon: '•' },
    { type: 'line',   label: 'ol', title: 'Numbered list',   prefix: '1. ', icon: '1.' },
    { type: 'line',   label: '>',  title: 'Blockquote',      prefix: '> ',  icon: '❝' },
    { type: 'sep' },
    { type: 'wrap',   label: '$',  title: 'Inline math (LaTeX)', before: '$', after: '$', icon: '$' },
    { type: 'insert', label: '$$', title: 'Display math (LaTeX)', text: '$$\n\n$$', icon: '$$' },
    { type: 'insert', label: '```', title: 'Code block', text: '```\n\n```', icon: '⌥' },
    { type: 'sep' },
    { type: 'insert', label: 'link', title: 'Link', text: '[text](url)', icon: '🔗' },
];

const BTN: React.CSSProperties = {
    fontFamily: 'var(--ff-mono)',
    fontSize: '11px',
    fontWeight: 600,
    padding: '4px 9px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
    color: 'var(--ink4)',
    transition: 'background 0.1s, color 0.1s',
    lineHeight: 1,
    minWidth: '28px',
    textAlign: 'center',
};

export function MarkdownEditor({ name, defaultValue = '', placeholder, minHeight = 320, required }: Props) {
    const [value, setValue] = useState(defaultValue);
    const [preview, setPreview] = useState(false);
    const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const apply = useCallback((item: ToolbarItem) => {
        const el = textareaRef.current;
        if (!el || item.type === 'sep') return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = value.slice(start, end);

        let newValue = value;
        let newCursorStart = start;
        let newCursorEnd = end;

        if (item.type === 'wrap') {
            const wrapped = item.before + (selected || 'text') + item.after;
            newValue = value.slice(0, start) + wrapped + value.slice(end);
            if (selected) {
                newCursorStart = start;
                newCursorEnd = start + wrapped.length;
            } else {
                newCursorStart = start + item.before.length;
                newCursorEnd = start + item.before.length + 4; // 'text'
            }
        } else if (item.type === 'line') {
            // Find start of line
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const lineContent = value.slice(lineStart, end);
            const newLine = item.prefix + lineContent;
            newValue = value.slice(0, lineStart) + newLine + value.slice(end);
            newCursorStart = lineStart + item.prefix.length;
            newCursorEnd = lineStart + newLine.length;
        } else if (item.type === 'insert') {
            newValue = value.slice(0, start) + item.text + value.slice(end);
            // Place cursor in the middle for block items
            const mid = item.text.indexOf('\n\n');
            if (mid !== -1) {
                newCursorStart = start + mid + 1;
                newCursorEnd = start + mid + 1;
            } else {
                newCursorStart = start;
                newCursorEnd = start + item.text.length;
            }
        }

        setValue(newValue);
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(newCursorStart, newCursorEnd);
        });
    }, [value]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg)' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '6px 10px', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass)', flexWrap: 'wrap' }}>
                {TOOLBAR.map((item, i) => {
                    if (item.type === 'sep') return (
                        <div key={`sep-${i}`} style={{ width: '1px', height: '16px', background: 'var(--glass-border)', margin: '0 3px', flexShrink: 0 }} />
                    );
                    const id = `${item.label}-${i}`;
                    return (
                        <button
                            key={id}
                            type="button"
                            title={item.title}
                            onMouseEnter={() => setHoveredBtn(id)}
                            onMouseLeave={() => setHoveredBtn(null)}
                            onClick={() => apply(item)}
                            style={{ ...BTN, background: hoveredBtn === id ? 'var(--sage-bg)' : 'transparent', color: hoveredBtn === id ? 'var(--sage)' : item.label.startsWith('$') ? 'var(--sage)' : 'var(--ink3)' }}
                        >
                            {item.icon}
                        </button>
                    );
                })}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={() => setPreview(false)} style={{ ...BTN, background: !preview ? 'var(--sage-bg)' : 'transparent', color: !preview ? 'var(--sage)' : 'var(--ink5)' }}>Edit</button>
                    <button type="button" onClick={() => setPreview(true)}  style={{ ...BTN, background: preview  ? 'var(--sage-bg)' : 'transparent', color: preview  ? 'var(--sage)' : 'var(--ink5)' }}>Preview</button>
                </div>
            </div>

            {/* Editor/Preview area */}
            {preview ? (
                <div style={{ minHeight, padding: '20px 24px', overflowY: 'auto' }}>
                    {value.trim() ? (
                        <MarkdownContent content={value} />
                    ) : (
                        <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink5)', fontStyle: 'italic' }}>Nothing to preview.</p>
                    )}
                </div>
            ) : (
                <textarea
                    ref={textareaRef}
                    name={name}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    style={{
                        border: 'none',
                        outline: 'none',
                        resize: 'vertical',
                        minHeight,
                        padding: '20px 24px',
                        fontFamily: 'var(--ff-mono)',
                        fontSize: '13px',
                        lineHeight: 1.75,
                        color: 'var(--ink2)',
                        background: 'transparent',
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                    onKeyDown={e => {
                        // Tab inserts 2 spaces
                        if (e.key === 'Tab') {
                            e.preventDefault();
                            const ta = e.currentTarget;
                            const s = ta.selectionStart;
                            const newVal = value.slice(0, s) + '  ' + value.slice(ta.selectionEnd);
                            setValue(newVal);
                            requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
                        }
                    }}
                />
            )}

            {/* Footer hint */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '6px 14px', borderTop: '1px solid var(--glass-border)', background: 'var(--glass)' }}>
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'var(--ink5)', letterSpacing: '0.04em' }}>
                    Markdown supported · Inline math: <code style={{ fontSize: '9px' }}>$E=mc^2$</code> · Display math: <code style={{ fontSize: '9px' }}>$$...$$</code>
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'var(--ink5)' }}>
                    {value.split(/\s+/).filter(Boolean).length} words
                </span>
            </div>
        </div>
    );
}
