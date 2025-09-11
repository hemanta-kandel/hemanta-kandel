import React, { useRef, MouseEvent } from 'react';
import { Icon } from './Icon';

interface Topic {
  id: string;
  name: string;
  icon: string;
}

interface TopicCardProps {
  topic: Topic;
  onSelect: (topicName: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onSelect }) => {
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const rotateX = -20 * ((y - height / 2) / height);
    const rotateY = 20 * ((x - width / 2) / width);

    cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <button
      ref={cardRef}
      key={topic.id}
      onClick={() => onSelect(topic.name)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="p-4 md:p-6 bg-brand-secondary/70 rounded-xl border border-slate-700/50 hover:border-brand-accent flex flex-col items-center justify-center text-center transition-transform duration-300 ease-out transform-gpu"
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      <div className="transform-gpu" style={{ transform: 'translateZ(40px)' }}>
         <Icon id={topic.icon} className="w-10 h-10 md:w-12 md:h-12 text-brand-accent mb-3" />
      </div>
      <h3
        className="font-semibold text-sm md:text-base text-brand-text transform-gpu"
        style={{ transform: 'translateZ(20px)' }}
       >
        {topic.name}
      </h3>
    </button>
  );
};
