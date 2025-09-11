import React, { useState } from 'react';
import type { Roadmap, RoadmapStage } from '../types';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';
import { generateRoadmap } from '../services/geminiService';

interface RoadmapGeneratorProps {
    savedRoadmaps: Roadmap[];
    setSavedRoadmaps: React.Dispatch<React.SetStateAction<Roadmap[]>>;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}

const StageDisplay: React.FC<{ stage: RoadmapStage, index: number }> = ({ stage, index }) => {
    const [isOpen, setIsOpen] = useState(index === 0);

    return (
        <div className="bg-brand-secondary/50 rounded-lg border border-slate-700/50 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex justify-between items-center text-left"
            >
                <div className="flex items-center">
                    <span className="text-brand-accent font-bold mr-4">{(index + 1).toString().padStart(2, '0')}</span>
                    <h3 className="text-lg font-semibold text-brand-text">{stage.title}</h3>
                </div>
                <Icon id="back" className={`w-5 h-5 text-brand-text-muted transition-transform ${isOpen ? '-rotate-90' : 'rotate-0'}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-700/50">
                    <p className="text-brand-text-muted mb-6">{stage.description}</p>
                    <div className="space-y-4">
                        {stage.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="p-4 bg-brand-primary rounded-md">
                                <h4 className="font-semibold text-brand-accent mb-2">{step.title}</h4>
                                <p className="text-sm text-brand-text mb-4">{step.description}</p>
                                <div className="space-y-2">
                                    {step.resources.map((res, resIndex) => (
                                        <a href={res.url} target="_blank" rel="noopener noreferrer" key={resIndex} className="block text-sm text-brand-text-muted hover:text-brand-accent hover:underline">
                                            - {res.title} <em className="text-xs opacity-70">({res.description})</em>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ savedRoadmaps, setSavedRoadmaps, isFullscreen, onToggleFullscreen }) => {
    const [topic, setTopic] = useState('');
    const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsLoading(true);
        setError(null);
        setCurrentRoadmap(null);

        try {
            const newRoadmap = await generateRoadmap(topic);
            setCurrentRoadmap(newRoadmap);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveRoadmap = () => {
        if (!currentRoadmap) return;
        setSavedRoadmaps(prev => {
            const existingIndex = prev.findIndex(r => r.topic.toLowerCase() === currentRoadmap.topic.toLowerCase());
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = currentRoadmap;
                return updated;
            }
            return [currentRoadmap, ...prev];
        });
        alert('Roadmap saved!');
    };

    const handleDeleteRoadmap = (topicToDelete: string) => {
        if (window.confirm(`Are you sure you want to delete the roadmap for "${topicToDelete}"?`)) {
            setSavedRoadmaps(prev => prev.filter(r => r.topic !== topicToDelete));
            if (currentRoadmap?.topic === topicToDelete) {
                setCurrentRoadmap(null);
            }
        }
    };

    return (
        <div className="max-w-full mx-auto h-full flex flex-col p-4 md:p-0">
            <div className="flex justify-between items-start mb-8">
                <div>
                    {!isFullscreen && (
                        <>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-brand-text">Roadmap Generator</h1>
                            <p className="text-brand-text-muted">Enter any topic to generate a personalized, step-by-step learning plan with resources.</p>
                        </>
                    )}
                </div>
                <div>
                    <button
                        onClick={onToggleFullscreen}
                        className="p-2 rounded-md text-brand-text-muted hover:bg-slate-700 hover:text-brand-accent"
                        title={isFullscreen ? "Exit Focus Mode" : "Enter Focus Mode"}
                    >
                        <Icon id={isFullscreen ? 'focus-exit' : 'focus-enter'} className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-8 overflow-hidden">
                {/* Saved Roadmaps List */}
                <div className="md:col-span-1 bg-brand-secondary/30 rounded-xl border border-slate-700/50 flex flex-col">
                    <h2 className="text-lg font-semibold text-brand-text p-4 border-b border-slate-700">My Saved Roadmaps</h2>
                    <ul className="overflow-y-auto p-2 space-y-1">
                        {savedRoadmaps.length > 0 ? savedRoadmaps.map((roadmap) => (
                            <li key={roadmap.topic}>
                                <div className={`group w-full text-left p-3 rounded-md flex justify-between items-center ${currentRoadmap?.topic === roadmap.topic ? 'bg-brand-accent/20' : 'hover:bg-slate-700/50'}`}>
                                    <button onClick={() => setCurrentRoadmap(roadmap)} className="flex-grow text-left">
                                        <p className="font-semibold text-brand-text">{roadmap.title}</p>
                                        <p className="text-sm text-brand-text-muted">{roadmap.topic}</p>
                                    </button>
                                    <button onClick={() => handleDeleteRoadmap(roadmap.topic)} className="ml-2 p-1 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Icon id="delete" className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        )) : (
                            <p className="p-4 text-sm text-brand-text-muted text-center">No saved roadmaps yet.</p>
                        )}
                    </ul>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3 bg-brand-secondary/50 rounded-xl border border-slate-700/50 flex flex-col">
                    <div className="p-4 border-b border-slate-700">
                        <form onSubmit={handleGenerate} className="flex items-center gap-3">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="What do you want to learn today?"
                                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !topic.trim()}
                                className="bg-brand-accent hover:bg-brand-accent-dark disabled:bg-slate-600 text-brand-primary font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Icon id="play" className="w-5 h-5" />
                                Generate
                            </button>
                        </form>
                    </div>

                    <div className="p-6 overflow-y-auto flex-grow">
                        {isLoading && <div className="flex items-center justify-center h-full"><LoadingSpinner text={`Building your roadmap for ${topic}...`} /></div>}
                        {error && <div className="text-red-400 text-center">{error}</div>}
                        {currentRoadmap && (
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-brand-text">{currentRoadmap.title}</h2>
                                        <p className="text-brand-text-muted mb-4">{currentRoadmap.summary}</p>
                                    </div>
                                    <button onClick={handleSaveRoadmap} className="flex items-center gap-2 text-brand-accent hover:text-brand-accent-dark font-semibold p-2 rounded-md hover:bg-brand-accent/10">
                                        <Icon id="save" className="w-5 h-5" />
                                        Save
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {currentRoadmap.stages.map((stage, index) => <StageDisplay key={index} stage={stage} index={index} />)}
                                </div>
                                {currentRoadmap.groundedSources && (
                                     <div className="mt-8">
                                        <h3 className="text-lg font-semibold text-brand-text-muted mb-2">Sources from Google Search</h3>
                                        <ul className="text-xs text-brand-text-muted list-disc list-inside">
                                            {currentRoadmap.groundedSources.map((source, i) => source.web && <li key={i}><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">{source.web.title}</a></li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                        {!isLoading && !currentRoadmap && !error && (
                            <div className="flex items-center justify-center h-full text-brand-text-muted text-center">
                                <div>
                                    <Icon id="roadmap" className="w-16 h-16 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-brand-text">Create Your Learning Path</h3>
                                    <p>Enter a topic above and let the AI build your personalized roadmap.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
