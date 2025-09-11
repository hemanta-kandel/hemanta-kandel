import React, { useState, useEffect, useRef } from 'react';

declare var hljs: any;

interface CodeBlockProps {
  code: string;
  language: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && typeof hljs !== 'undefined') {
        try {
            const result = hljs.highlight(code, {
              language: language,
              ignoreIllegals: true,
            });
            codeRef.current.innerHTML = result.value;
        } catch (e) {
            console.error("Highlighting failed in CodeBlock:", e);
            codeRef.current.textContent = code; // Fallback to plain text
        }
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-brand-primary rounded-lg relative font-mono text-sm border border-slate-700">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 bg-slate-700/50 hover:bg-slate-600 rounded-md text-brand-text-muted hover:text-brand-text transition-colors duration-200"
        aria-label="Copy code"
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
      <pre className="p-4 pt-12 overflow-x-auto">
        <code ref={codeRef} className={`language-${language} text-brand-text`}>
          {/* Content is programmatically set by highlight.js */}
        </code>
      </pre>
    </div>
  );
};