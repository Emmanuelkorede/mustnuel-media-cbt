// =============================================================================
// src/components/CBT/QuestionRenderer.jsx
// =============================================================================

import { useMemo } from 'react';
import katex from 'katex';

function renderMath(text = '') {
  if (!text) return null;

  const parts = [];
  let key = 0;

  // Regex matches $$...$$ (display mode) or $...$ (inline mode)
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  let lastIndex = 0;
  let match;

  while ((match = mathRegex.exec(text)) !== null) {
    // Inject standard text segment before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++}>{text.slice(lastIndex, match.index)}</span>
      );
    }

    const raw = match[0];
    const isDisplay = raw.startsWith('$$');
    const latex = isDisplay
      ? raw.slice(2, -2).trim()
      : raw.slice(1, -1).trim();

    try {
      const html = katex.renderToString(latex, {
        displayMode: isDisplay,
        throwOnError: false,
        strict: false,
        trust: true,
        output: 'html',
      });

      parts.push(
        isDisplay ? (
          <span
            key={key++}
            className="block my-3 overflow-x-auto clear-both"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <span
            key={key++}
            className="inline mx-0.5 fallback-math"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      );
    } catch {
      // Graceful fallback rendering raw LaTeX text code block if parsing crashes
      parts.push(
        <span key={key++} className="text-error font-mono bg-red-500/5 px-1 rounded">
          {raw}
        </span>
      );
    }

    lastIndex = match.index + raw.length;
  }

  // Inject trailing regular text pieces
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
}

export default function QuestionRenderer({ text = '', inline = false, className = '' }) {
  const rendered = useMemo(() => renderMath(text), [text]);

  const baseStyles = "leading-relaxed text-text-primary tracking-normal break-words";

  if (inline) {
    return (
      <span 
        className={`${baseStyles} text-sm ${className}`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {rendered}
      </span>
    );
  }

  return (
    <p 
      className={`${baseStyles} text-base ${className}`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {rendered}
    </p>
  );
}