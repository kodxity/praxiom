'use client';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Props {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export function MarkdownContent({ content, className, style }: Props) {
  return (
    <div className={`md-body ${className ?? ''}`} style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex as any]}
        components={{
          h1: ({ children }) => <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.7em', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.2, margin: '1.4em 0 0.6em' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.35em', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.2, margin: '1.2em 0 0.5em' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontFamily: 'var(--ff-ui)', fontSize: '1.05em', fontWeight: 600, color: 'var(--ink)', margin: '1em 0 0.4em' }}>{children}</h3>,
          p: ({ children, node }: any) => {
            // Avoid invalid nesting: if this paragraph wraps a block element (pre, div, etc.)
            // render a div instead of p to prevent hydration errors
            const hasBlock = node?.children?.some((c: any) =>
              ['pre', 'div', 'blockquote', 'ul', 'ol', 'table', 'figure'].includes(c.tagName)
            );
            return hasBlock
              ? <div style={{ margin: '0 0 1em', lineHeight: 1.8, color: 'var(--ink2)' }}>{children}</div>
              : <p style={{ margin: '0 0 1em', lineHeight: 1.8, color: 'var(--ink2)' }}>{children}</p>;
          },
          strong: ({ children }) => <strong style={{ fontWeight: 600, color: 'var(--ink)' }}>{children}</strong>,
          em: ({ children }) => <em style={{ fontStyle: 'italic', color: 'var(--ink2)' }}>{children}</em>,
          a: ({ href, children }) => <a href={href} style={{ color: 'var(--sage)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>{children}</a>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: '3px solid var(--sage)', margin: '1.2em 0', paddingLeft: '1.2em', color: 'var(--ink3)', fontStyle: 'italic' }}>
              {children}
            </blockquote>
          ),
          code: ({ inline, children, ...props }: any) =>
            inline ? (
              <code style={{ fontFamily: 'var(--ff-mono)', fontSize: '0.88em', background: 'rgba(107,148,120,0.10)', borderRadius: '4px', padding: '1px 6px', color: 'var(--sage)' }}>{children}</code>
            ) : (
              <pre style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', background: 'rgba(0,0,0,0.04)', borderRadius: '10px', padding: '16px 20px', overflow: 'auto', margin: '1.2em 0', lineHeight: 1.6 }}>
                <code>{children}</code>
              </pre>
            ),
          ul: ({ children }) => <ul style={{ margin: '0.8em 0 1em 1.4em', listStyleType: 'disc', color: 'var(--ink2)' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: '0.8em 0 1em 1.6em', listStyleType: 'decimal', color: 'var(--ink2)' }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: '0.3em', lineHeight: 1.7 }}>{children}</li>,
          hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1.8em 0' }} />,
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '1.2em 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>{children}</table>
            </div>
          ),
          th: ({ children }) => <th style={{ fontFamily: 'var(--ff-ui)', fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink4)', padding: '8px 12px', borderBottom: '2px solid var(--glass-border)', textAlign: 'left' }}>{children}</th>,
          td: ({ children }) => <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--glass-border)', color: 'var(--ink2)', verticalAlign: 'top' }}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
