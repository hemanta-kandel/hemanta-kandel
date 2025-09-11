import React, { useState, useEffect, useRef } from 'react';
import type { LessonNote, ChatMessage } from './types';
import { Icon } from './components/Icon';

interface JournalProps {
  journal: LessonNote[];
  setJournal: React.Dispatch<React.SetStateAction<LessonNote[]>>;
  onSelectLesson: (lessonTitle: string, topicName: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const ChatHistoryViewer: React.FC<{ history: ChatMessage[] }> = ({ history }) => (
  <div className="space-y-4">
    {history.map((msg, index) => (
      <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
        {msg.sender === 'model' && 
          <span className="flex-shrink-0 text-brand-accent pt-1.5">
            <Icon id="robot" className="w-6 h-6" />
          </span>
        }
        <div
          className={`max-w-xl rounded-xl px-4 py-2.5 whitespace-pre-wrap ${
            msg.sender === 'user'
              ? 'bg-brand-accent text-brand-primary font-medium'
              : 'bg-slate-700 text-brand-text'
          }`}
        >
          {msg.text}
        </div>
      </div>
    ))}
  </div>
);

export const Journal: React.FC<JournalProps> = ({ journal, setJournal, onSelectLesson, isFullscreen, onToggleFullscreen }) => {
  const [selectedNote, setSelectedNote] = useState<LessonNote | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (selectedNote) {
      setNoteContent(selectedNote.notes);
    } else {
      setNoteContent('');
    }
  }, [selectedNote]);
  
  useEffect(() => {
    if (selectedNote) {
        if(debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = window.setTimeout(() => {
            setJournal(prevJournal => {
                return prevJournal.map(note => 
                    note.lessonTitle === selectedNote.lessonTitle && note.topicName === selectedNote.topicName
                    ? { ...note, notes: noteContent }
                    : note
                );
            });
        }, 1000); // Auto-save after 1 second of inactivity
    }
    return () => {
        if(debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    }
  }, [noteContent, selectedNote, setJournal]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div>
          {!isFullscreen && (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-brand-text">My Journal</h1>
              <p className="text-brand-text-muted">Review your lesson chat history and keep personal notes. Notes are saved automatically.</p>
            </>
          )}
        </div>
        <div>
          <button
              onClick={onToggleFullscreen}
              className="p-2 rounded-md text-brand-text-muted hover:bg-slate-700 hover:text-brand-accent"
              title={isFullscreen ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
              <Icon id={isFullscreen ? 'focus-exit' : 'focus-enter'} className="w-5 h-5"/>
          </button>
        </div>
      </div>
      
      {journal.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-center text-brand-text-muted">
            <p>Your journal is empty. Start a lesson to save your progress here.</p>
        </div>
      ) : (
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 overflow-hidden">
          {/* Note List */}
          <div className="md:col-span-1 lg:col-span-1 bg-brand-secondary/30 rounded-xl border border-slate-700/50 flex flex-col">
             <h2 className="text-lg font-semibold text-brand-text p-4 border-b border-slate-700">My Lessons</h2>
             <ul className="overflow-y-auto p-2 space-y-1">
                {journal.map((note, index) => (
                    <li key={index}>
                        <button onClick={() => setSelectedNote(note)} className={`w-full text-left p-3 rounded-md transition-colors ${selectedNote?.lessonTitle === note.lessonTitle && selectedNote?.topicName === note.topicName ? 'bg-brand-accent/20' : 'hover:bg-slate-700/50'}`}>
                            <p className="font-semibold text-brand-text">{note.lessonTitle}</p>
                            <p className="text-sm text-brand-text-muted">{note.topicName}</p>
                        </button>
                    </li>
                ))}
             </ul>
          </div>
          {/* Note Content */}
          <div className="md:col-span-2 lg:col-span-3 bg-brand-secondary/50 rounded-xl border border-slate-700/50 flex flex-col overflow-hidden">
            {selectedNote ? (
                <>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-brand-text">{selectedNote.lessonTitle}</h2>
                        <p className="text-brand-text-muted">{selectedNote.topicName}</p>
                    </div>
                    <button onClick={() => onSelectLesson(selectedNote.lessonTitle, selectedNote.topicName)} className="text-brand-accent hover:text-brand-accent-dark font-semibold">Revisit Lesson</button>
                </div>
                <div className="flex-grow grid grid-rows-2 gap-4 p-4 overflow-y-auto">
                    <div className="row-span-1 overflow-y-auto bg-brand-primary/50 p-4 rounded-md">
                        <h3 className="text-lg font-semibold text-brand-accent mb-3">Chat History</h3>
                        <ChatHistoryViewer history={selectedNote.chatHistory} />
                    </div>
                    <div className="row-span-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-brand-accent mb-3">My Notes</h3>
                        <textarea 
                            value={noteContent}
                            onChange={handleNoteChange}
                            placeholder="Write your personal notes for this lesson here..."
                            className="flex-grow bg-brand-primary/50 p-4 rounded-md text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent w-full resize-none"
                        />
                    </div>
                </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-brand-text-muted">
                    <p>Select a lesson from the left to view its details.</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
