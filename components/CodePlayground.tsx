import React, { useState } from 'react';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';
import { runCode } from '../services/geminiService';
import { CodeEditorWithLineNumbers } from './CodeEditorWithLineNumbers';

const LANGUAGES = [
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'java', name: 'Java' },
  { id: 'csharp', name: 'C#' },
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'rust', name: 'Rust' },
  { id: 'r', name: 'R' },
];

interface CodePlaygroundProps {
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({ isFullscreen, onToggleFullscreen }) => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ output: string; explanation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const responseText = await runCode(language, code);
      setResult(JSON.parse(responseText));
    } catch (err) {
      console.error("Failed to run code:", err);
      setError("Sorry, I couldn't process the code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto h-full flex flex-col ${isFullscreen ? 'p-4' : ''}`}>
      {!isFullscreen && (
        <>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-brand-text">Code Playground</h1>
            <p className="text-brand-text-muted mb-8">Experiment with code in various languages. The AI will simulate execution and explain the result.</p>
        </>
      )}
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Side */}
        <div className="flex flex-col bg-brand-secondary/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between p-3 border-b border-slate-700">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              {LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.name}</option>)}
            </select>
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleFullscreen}
                    className="p-2 rounded-md text-brand-text-muted hover:bg-slate-700 hover:text-brand-accent"
                    title={isFullscreen ? "Exit Focus Mode" : "Enter Focus Mode"}
                >
                    <Icon id={isFullscreen ? 'focus-exit' : 'focus-enter'} className="w-5 h-5"/>
                </button>
                <button
                onClick={handleRunCode}
                disabled={isLoading || !code.trim()}
                className="bg-brand-accent hover:bg-brand-accent-dark disabled:bg-slate-600 text-brand-primary font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                <Icon id="play" className="w-5 h-5" />
                Run Code
                </button>
            </div>
          </div>
          <CodeEditorWithLineNumbers
            language={language}
            value={code}
            onChange={setCode}
            placeholder={`// Write your ${LANGUAGES.find(l => l.id === language)?.name} code here...`}
          />
        </div>

        {/* Output Side */}
        <div className="bg-brand-secondary/50 rounded-xl border border-slate-700/50 flex flex-col">
          <div className="p-3 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-brand-text">Output & Explanation</h2>
          </div>
          <div className="p-4 overflow-y-auto flex-grow">
            {isLoading && <LoadingSpinner text="Simulating execution..." />}
            {error && <div className="text-red-400">{error}</div>}
            {result && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-brand-accent mb-2">Output</h3>
                  <div className="bg-brand-primary p-4 rounded-md font-mono text-sm text-brand-text-muted whitespace-pre-wrap">
                    {result.output || '(No output produced)'}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-accent mb-2">Explanation</h3>
                  <p className="text-brand-text">{result.explanation}</p>
                </div>
              </div>
            )}
            {!isLoading && !error && !result && (
              <div className="text-center text-brand-text-muted pt-16">
                <p>Your code's output will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
