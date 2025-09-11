

import React, { useState, useRef, useLayoutEffect } from 'react';

declare var hljs: any;

interface CodeEditorWithLineNumbersProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CodeEditorWithLineNumbers: React.FC<CodeEditorWithLineNumbersProps> = ({ value, onChange, language, placeholder }) => {
  const [lineCount, setLineCount] = useState(1);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update highlighting when value or language changes
  useLayoutEffect(() => {
    if (codeRef.current) {
      try {
        const result = hljs.highlight(value, {
          language: language,
          ignoreIllegals: true,
        });

        // Use the highlighted HTML if available, otherwise fall back to plain text.
        // This ensures the editor view is never empty, even if highlighting fails.
        if (result && result.value) {
            codeRef.current.innerHTML = result.value;
        } else {
            codeRef.current.textContent = value;
        }
      } catch (e) {
        // If highlighting throws an error, fall back to displaying plain text.
        console.error("Syntax highlighting failed, falling back to plain text.", e);
        codeRef.current.textContent = value;
      }
    }
  }, [value, language]);

  // Update line numbers
  useLayoutEffect(() => {
    const newLines = value.split('\n').length || 1;
    if(newLines !== lineCount) {
        setLineCount(newLines);
    }
  }, [value, lineCount]);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current && preRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      lineNumbersRef.current.scrollTop = scrollTop;
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
  };

  return (
    <div className="editor-wrapper">
      <div ref={lineNumbersRef} className="editor-linenumbers" aria-hidden="true">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className="editor-main">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          className="editor-textarea"
          spellCheck="false"
          placeholder={!value ? placeholder : ''}
          aria-label="Code Editor"
        />
        <pre ref={preRef} className="editor-pre" aria-hidden="true">
          <code ref={codeRef} className={`language-${language}`}>
            {/* Content is programmatically set by highlight.js */}
          </code>
        </pre>
      </div>
    </div>
  );
};
