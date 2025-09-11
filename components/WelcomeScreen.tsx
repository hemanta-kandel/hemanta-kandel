import React, { useState, useMemo } from 'react';
import { TOPICS } from '../constants';
import { Icon } from './Icon';
import { TopicCard } from './TopicCard';

interface WelcomeScreenProps {
  onSelectTopic: (topic: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectTopic }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = useMemo(() => {
    if (!searchQuery) {
      return TOPICS;
    }
    return TOPICS.filter(topic =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col items-center justify-start h-full text-center p-4 pt-16">
      <h1 className="text-5xl md:text-6xl font-bold text-brand-text mb-4">Welcome to Synapse Scholar</h1>
      <p className="text-xl text-brand-text-muted max-w-3xl mb-8">
        Your AI-powered guide to mastering any technical or academic field. Select a topic to generate a complete learning curriculum.
      </p>

      <div className="w-full max-w-2xl mb-10 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon id="search" className="h-5 w-5 text-brand-text-muted" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics like 'AI', 'Calculus', or 'World History'..."
          className="w-full bg-brand-secondary border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all duration-200"
          aria-label="Search for a learning topic"
        />
      </div>
      
      {filteredTopics.length > 0 ? (
        <div className="w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 perspective-container">
          {filteredTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onSelect={onSelectTopic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-brand-text">No topics found for "{searchQuery}"</p>
          <p className="text-brand-text-muted mt-2">Try a different search term or clear the search to see all topics.</p>
        </div>
      )}
    </div>
  );
};