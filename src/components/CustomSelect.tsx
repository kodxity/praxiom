'use client';
import { useState, useRef, useEffect, CSSProperties } from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    /** Outer container style — use for width constraints */
    style?: CSSProperties;
    /** 'filter' = compact bar style  |  'field' = full-width form field style */
    variant?: 'filter' | 'field';
}

export default function CustomSelect({
    value, onChange, options, placeholder, style, variant = 'filter',
}: CustomSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = options.find(o => o.value === value);
    const isFilter = variant === 'filter';

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const triggerStyle: CSSProperties = isFilter ? {
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: `1.5px solid ${open ? 'var(--sage)' : 'rgba(0,0,0,0.09)'}`,
        boxShadow: open ? '0 0 0 3px rgba(107,148,120,0.12)' : '0 1px 3px rgba(0,0,0,0.07)',
        borderRadius: 'var(--r-lg)',
        padding: '9px 34px 9px 13px',
        fontFamily: 'var(--ff-ui)', fontSize: '13px', fontWeight: 500,
        color: selected ? 'var(--ink2)' : 'var(--ink5)',
        outline: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        width: '100%', textAlign: 'left',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%236b9478' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 11px center',
    } : {
        background: 'rgba(255,255,255,0.5)',
        border: `1.5px solid ${open ? 'var(--sage)' : 'rgba(0,0,0,0.10)'}`,
        boxShadow: open ? '0 0 0 3px rgba(107,148,120,0.12)' : 'none',
        borderRadius: 'var(--r)',
        padding: '11px 34px 11px 14px',
        fontFamily: 'var(--ff-body)', fontSize: '15px', fontWeight: 400,
        color: selected ? 'var(--ink)' : 'var(--ink5)',
        outline: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        width: '100%', textAlign: 'left',
        transition: 'all 0.15s',
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%236b9478' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 11px center',
    };

    return (
        <div ref={ref} style={{ position: 'relative', ...style }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                onKeyDown={e => {
                    if (e.key === 'Escape') setOpen(false);
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); }
                }}
                style={triggerStyle}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {selected ? selected.label : (placeholder ?? 'Select…')}
            </button>

            {open && (
                <div
                    role="listbox"
                    style={{
                        position: 'absolute', zIndex: 9999,
                        top: 'calc(100% + 4px)', left: 0, right: 0,
                        background: 'rgba(252,250,246,0.97)',
                        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                        border: '1.5px solid rgba(0,0,0,0.10)',
                        borderRadius: 'var(--r-lg)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                        overflow: 'auto', maxHeight: '240px',
                        padding: '4px 0',
                    }}
                >
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            role="option"
                            aria-selected={opt.value === value}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            style={{
                                padding: isFilter ? '8px 13px' : '10px 14px',
                                cursor: 'pointer',
                                fontFamily: isFilter ? 'var(--ff-ui)' : 'var(--ff-body)',
                                fontSize: isFilter ? '13px' : '15px',
                                fontWeight: isFilter ? 500 : 400,
                                color: opt.value === value ? 'var(--sage)' : 'var(--ink2)',
                                background: opt.value === value ? 'rgba(107,148,120,0.09)' : 'transparent',
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => {
                                if (opt.value !== value) e.currentTarget.style.background = 'rgba(107,148,120,0.06)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = opt.value === value ? 'rgba(107,148,120,0.09)' : 'transparent';
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
