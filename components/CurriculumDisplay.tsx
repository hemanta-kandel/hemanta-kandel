import React from 'react';
import type { Curriculum, CurriculumModule } from '../types';
import { Icon } from './Icon';

interface CurriculumDisplayProps {
    curriculum: Curriculum;
    topicName: string;
    completedLessons: string[];
    onSelectLesson: (lessonTitle: string) => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}

const ModuleCard: React.FC<{
    module: CurriculumModule;
    isCompleted: boolean;
    onSelect: () => void;
}> = ({ module, isCompleted, onSelect }) => (
    <button
        onClick={onSelect}
        className={`w-full bg-brand-secondary/60 p-5 rounded-lg border border-slate-700/50 text-left hover:border-brand-accent hover:bg-slate-800/80 transition-all duration-200 transform hover:-translate-y-1 flex flex-col relative ${isCompleted ? 'opacity-60 bg-slate-800/50' : ''}`}
    >
        {isCompleted && (
            <div className="absolute top-3 right-3 text-green-400" title="Completed">
                <Icon id="check" className="w-5 h-5" />
            </div>
        )}
        <h3 className={`font-bold text-md mb-1 ${isCompleted ? 'text-brand-text-muted' : 'text-brand-text'}`}>{module.title}</h3>
        <p className="text-brand-text-muted text-sm flex-grow">{module.description}</p>
    </button>
);


export const CurriculumDisplay: React.FC<CurriculumDisplayProps> = ({ curriculum, topicName, onSelectLesson, completedLessons, isFullscreen, onToggleFullscreen }) => {
    return (
        <div className="max-w-7xl mx-auto">
             <div className={`relative ${!isFullscreen ? 'mb-4' : 'mb-2'}`}>
                {!isFullscreen && (
                <h1 className="text-4xl md:text-5xl font-bold text-center text-brand-text">
                    Your Learning Path for {topicName}
                </h1>
                )}
                <div className="absolute top-0 right-0">
                    <button
                        onClick={onToggleFullscreen}
                        className="p-2 rounded-md text-brand-text-muted hover:bg-slate-700 hover:text-brand-accent"
                        title={isFullscreen ? "Exit Focus Mode" : "Enter Focus Mode"}
                    >
                        <Icon id={isFullscreen ? 'focus-exit' : 'focus-enter'} className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            {!isFullscreen && (
                <p className="text-center text-brand-text-muted mb-12 max-w-3xl mx-auto">
                    This is your interactive knowledge graph. Select a module to begin a lesson.
                </p>
            )}

            {curriculum.projectIdea && (
                 <div className="mb-12 p-6 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-center">
                    <h3 className="text-2xl font-bold text-brand-accent mb-2 flex items-center justify-center gap-3">
                        <Icon id="project" className="w-8 h-8" /> Capstone Project Idea
                    </h3>
                    <h4 className="text-xl font-semibold text-brand-text">{curriculum.projectIdea.title}</h4>
                    <p className="text-brand-text-muted mt-1 max-w-2xl mx-auto">{curriculum.projectIdea.description}</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 hidden md:block" />
                
                {/* Beginner */}
                <div className="w-full md:w-1/3 flex flex-col items-center z-10">
                    <div className="flex items-center justify-center gap-3 text-3xl font-bold text-brand-accent mb-6 p-3 bg-brand-primary rounded-full border-2 border-slate-700">
                        <Icon id="beginner" className="w-9 h-9" />
                        <span className="hidden lg:inline">Beginner</span>
                    </div>
                    <div className="w-full space-y-3">
                        {curriculum.beginner.map(mod => 
                            <ModuleCard 
                                key={mod.title} 
                                module={mod} 
                                isCompleted={completedLessons.includes(mod.title)}
                                onSelect={() => onSelectLesson(mod.title)} />
                        )}
                    </div>
                </div>

                 {/* Intermediate */}
                 <div className="w-full md:w-1/3 flex flex-col items-center z-10">
                    <div className="flex items-center justify-center gap-3 text-3xl font-bold text-brand-accent mb-6 p-3 bg-brand-primary rounded-full border-2 border-slate-700">
                        <Icon id="intermediate" className="w-9 h-9" />
                        <span className="hidden lg:inline">Intermediate</span>
                    </div>
                    <div className="w-full space-y-3">
                        {curriculum.intermediate.map(mod => 
                            <ModuleCard 
                                key={mod.title} 
                                module={mod} 
                                isCompleted={completedLessons.includes(mod.title)}
                                onSelect={() => onSelectLesson(mod.title)} />
                        )}
                    </div>
                </div>

                 {/* Advanced */}
                 <div className="w-full md:w-1/3 flex flex-col items-center z-10">
                    <div className="flex items-center justify-center gap-3 text-3xl font-bold text-brand-accent mb-6 p-3 bg-brand-primary rounded-full border-2 border-slate-700">
                        <Icon id="advanced" className="w-9 h-9" />
                        <span className="hidden lg:inline">Advanced</span>
                    </div>
                    <div className="w-full space-y-3">
                        {curriculum.advanced.map(mod => 
                            <ModuleCard 
                                key={mod.title} 
                                module={mod} 
                                isCompleted={completedLessons.includes(mod.title)}
                                onSelect={() => onSelectLesson(mod.title)} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
