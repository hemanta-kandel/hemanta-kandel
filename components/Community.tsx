import React, { useState, useMemo, useCallback } from 'react';
import { TOPICS } from '../constants';
import { generateProjectShowcase, generateConceptImage } from '../services/geminiService';
import type { ShowcaseProject, ProjectIdea } from '../types';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';

const ProjectCard: React.FC<{ project: ShowcaseProject }> = ({ project }) => (
    <div className="bg-brand-secondary/50 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col group">
        <div className="relative aspect-video overflow-hidden">
            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-lg font-bold text-white">{project.title}</h3>
                <span className="text-xs text-brand-accent font-semibold">{project.topicName}</span>
            </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <p className="text-brand-text-muted text-sm mb-4 flex-grow">{project.description}</p>
            <button
                onClick={() => alert('Discussion feature coming soon!')}
                className="mt-auto w-full text-center bg-slate-700/80 hover:bg-slate-700 text-brand-text font-semibold py-2 rounded-md transition-colors"
            >
                Discuss Project
            </button>
        </div>
    </div>
);

interface CommunityProps {
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}

export const Community: React.FC<CommunityProps> = ({ isFullscreen, onToggleFullscreen }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [projects, setProjects] = useState<ShowcaseProject[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredTopics = useMemo(() => {
        if (!searchQuery) {
            return TOPICS;
        }
        return TOPICS.filter(topic =>
            topic.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const handleSelectTopic = useCallback(async (topicName: string) => {
        setSelectedTopic(topicName);
        setIsLoading(true);
        setError(null);
        setProjects([]);

        try {
            const projectIdeas: ProjectIdea[] = await generateProjectShowcase(topicName);
            
            const projectsWithImages: ShowcaseProject[] = await Promise.all(
                projectIdeas.map(async (idea) => {
                    const imageUrl = await generateConceptImage(topicName, idea.title);
                    return { ...idea, imageUrl, topicName };
                })
            );
            
            setProjects(projectsWithImages);
        } catch (err) {
            console.error("Failed to generate project showcase:", err);
            setError(`Sorry, I couldn't generate projects for ${topicName}. Please try another topic.`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="max-w-full mx-auto h-full flex flex-col p-4 md:p-0">
             <div className="flex justify-between items-start mb-8">
                <div>
                  {!isFullscreen && (
                    <>
                      <h1 className="text-4xl md:text-5xl font-bold mb-2 text-brand-text">Community Showcase</h1>
                      <p className="text-brand-text-muted">Explore capstone project ideas from various fields for inspiration.</p>
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

            <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-8 overflow-hidden">
                {/* Topic List */}
                <div className="md:col-span-1 bg-brand-secondary/30 rounded-xl border border-slate-700/50 flex flex-col">
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-lg font-semibold text-brand-text mb-3">Topics</h2>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search topics..."
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-accent"
                        />
                    </div>
                    <ul className="overflow-y-auto p-2 space-y-1">
                        {filteredTopics.map(topic => (
                            <li key={topic.id}>
                                <button
                                    onClick={() => handleSelectTopic(topic.name)}
                                    className={`w-full text-left p-3 rounded-md transition-colors text-sm flex items-center gap-3 ${selectedTopic === topic.name ? 'bg-brand-accent/20 text-brand-accent' : 'text-brand-text-muted hover:bg-slate-700/50 hover:text-brand-text'}`}
                                >
                                    <Icon id={topic.icon} className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-medium">{topic.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Projects Display */}
                <div className="md:col-span-3 bg-brand-secondary/50 rounded-xl border border-slate-700/50 p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <LoadingSpinner text={`Generating projects for ${selectedTopic}...`} />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full text-red-400 text-center">
                            <p>{error}</p>
                        </div>
                    ) : projects.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {projects.map(p => <ProjectCard key={p.title} project={p} />)}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-brand-text-muted text-center">
                            <div>
                                <Icon id="project" className="w-16 h-16 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-brand-text">Select a Topic</h3>
                                <p>Choose a topic from the list to see AI-generated project ideas.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
