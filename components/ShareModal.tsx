import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    topicName: string;
    lessonTitle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, topicName, lessonTitle }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const shareUrl = `https://synapsescholar.ai/learn/${encodeURIComponent(topicName)}/${encodeURIComponent(lessonTitle)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    // Close modal on escape key press
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);


    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
        >
            <div 
                className="bg-brand-secondary rounded-2xl p-8 shadow-2xl border border-slate-700 w-full max-w-lg relative transition-transform transform duration-300 scale-100"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-brand-text-muted hover:text-brand-text transition-colors"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <div className="text-center">
                    <Icon id="share" className="w-12 h-12 text-brand-accent mx-auto mb-4" />
                    <h2 id="share-modal-title" className="text-2xl font-bold text-brand-text mb-2">Share this Lesson</h2>
                    <p className="text-brand-text-muted mb-6">Anyone with this link can view a summary of this lesson.</p>
                </div>

                <div className="flex items-center space-x-2 bg-brand-primary p-2 rounded-lg border border-slate-600">
                    <input 
                        type="text" 
                        readOnly 
                        value={shareUrl} 
                        className="w-full bg-transparent text-brand-text-muted font-mono text-sm p-2 outline-none" 
                        aria-label="Sharable link"
                    />
                    <button 
                        onClick={handleCopy}
                        className="flex-shrink-0 bg-brand-accent hover:bg-brand-accent-dark text-brand-primary font-bold py-2 px-4 rounded-md transition-colors text-sm"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};