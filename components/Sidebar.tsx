import React from 'react';
import { Icon } from './Icon';
import type { View } from '../types';

interface SidebarProps {
  currentView: View;
  onSetView: (view: View) => void;
  selectedTopic: string | null;
  onReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSetView, selectedTopic, onReset }) => {
  const NavButton: React.FC<{
    viewName: View,
    iconId: string,
    label: string,
    disabled?: boolean
  }> = ({ viewName, iconId, label, disabled = false }) => (
    <button
      onClick={() => onSetView(viewName)}
      disabled={disabled}
      className={`w-full flex items-center justify-center md:justify-start p-3 rounded-lg transition-all duration-200 text-left ${
        currentView === viewName
          ? 'bg-brand-accent/20 text-brand-accent'
          : 'text-brand-text-muted hover:bg-slate-700/50 hover:text-brand-text'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={label}
    >
      <Icon id={iconId} className="w-6 h-6 flex-shrink-0" />
      <span className="ml-4 font-semibold hidden md:block">{label}</span>
    </button>
  );

  return (
    <nav className="w-16 md:w-64 bg-brand-secondary p-2 md:p-4 border-r border-slate-700/50 flex flex-col">
      <div className="flex items-center justify-center md:justify-start mb-4 md:mb-8 cursor-pointer" onClick={() => onSetView('learning')}>
        <Icon id="app-logo" className="w-8 h-8 text-brand-accent" />
        <span className="text-2xl font-bold text-brand-accent hidden md:block ml-2">Synapse</span>
      </div>
      
      {selectedTopic && (
          <div className="mb-4">
              <button
                onClick={onReset}
                className="w-full flex items-center justify-center md:justify-start p-3 rounded-lg transition-all duration-200 text-left bg-red-500/10 text-red-400 hover:bg-red-500/20"
                title="Reset & Change Topic"
              >
                <Icon id="back" className="h-6 w-6 flex-shrink-0" />
                <span className="ml-3 font-semibold hidden md:block">Change Topic</span>
              </button>
          </div>
      )}

      <ul className="space-y-2">
        <li>
            <NavButton viewName="learning" iconId="concept" label="My Learning" disabled={!selectedTopic} />
        </li>
        <li>
            <NavButton viewName="community" iconId="community" label="Community Showcase" />
        </li>
        <li>
            <NavButton viewName="playground" iconId="code" label="Code Playground" />
        </li>
        <li>
            <NavButton viewName="roadmap" iconId="roadmap" label="Roadmap Generator" />
        </li>
        <li>
            <NavButton viewName="journal" iconId="journal" label="My Journal" disabled={!selectedTopic} />
        </li>
      </ul>

      <div className="mt-auto text-center p-2 text-brand-text-muted text-xs hidden md:block">
        <p>Powered by Gemini</p>
      </div>
    </nav>
  );
};