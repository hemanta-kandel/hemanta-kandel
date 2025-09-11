import React, { useState } from 'react';
import type { Lesson, ResourceLink } from '../types';
import { CodeBlock } from './CodeBlock';
import { Icon } from './Icon';
import { ShareModal } from './ShareModal';

interface SectionProps {
    title: string;
    children: React.ReactNode;
    icon: string;
}

const Section: React.FC<SectionProps> = ({ title, children, icon }) => (
    <div className="bg-brand-secondary/50 rounded-xl p-6 mb-8 shadow-lg border border-slate-700/50">
        <h2 className="text-2xl font-bold text-brand-accent mb-4 flex items-center">
            <Icon id={icon} className="w-8 h-8 mr-3 text-brand-accent" />
            {title}
        </h2>
        <div className="prose prose-invert max-w-none prose-p:text-brand-text prose-li:text-brand-text-muted prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-brand-text">
             {children}
        </div>
    </div>
);

const ResourceSection: React.FC<{title: string, icon: string, resources: ResourceLink[]}> = ({title, icon, resources}) => {
    if (!resources || resources.length === 0) return null;
    return (
        <Section title={title} icon={icon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((res, index) => (
                    <a href={res.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-4 bg-brand-primary/50 rounded-lg border border-slate-600 hover:border-brand-accent transition-colors">
                        <h4 className="font-semibold text-brand-text">{res.title}</h4>
                        <p className="text-sm text-brand-text-muted mt-1">{res.description}</p>
                    </a>
                ))}
            </div>
        </Section>
    )
}

interface MainContentProps {
    lesson: Lesson;
    onBack: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({ lesson, onBack, isFullscreen, onToggleFullscreen }) => {
  const [isShareModalOpen, setShareModalOpen] = useState(false);

  const renderContent = (content: string) => {
    if (!content) return null;

    const processInlineFormatting = (line: string): string => {
        return line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-accent hover:underline">$1</a>');
    };

    const blocks = content.split('\n\n').filter(block => block.trim() !== '');

    const htmlElements = blocks.map((block) => {
        const trimmedBlock = block.trim();
        
        if (trimmedBlock.startsWith('### ')) {
            return `<h3 class="text-xl font-semibold text-brand-text mt-6 mb-3">${processInlineFormatting(trimmedBlock.substring(4))}</h3>`;
        }
        
        if (trimmedBlock.startsWith('* ') || trimmedBlock.startsWith('- ')) {
            const listItems = trimmedBlock.split('\n').map(item =>
                `<li class="ml-5 list-disc mb-2">${processInlineFormatting(item.replace(/^[\*\-]\s/, ''))}</li>`
            ).join('');
            return `<ul class="space-y-1">${listItems}</ul>`;
        }
        
        return `<p class="mb-4">${processInlineFormatting(trimmedBlock)}</p>`;
    });

    const finalHtml = htmlElements.join('');

    return <div dangerouslySetInnerHTML={{ __html: finalHtml }} />;
  };

  return (
    <>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        topicName={lesson.topicName || 'General'}
        lessonTitle={lesson.conceptTitle}
      />
      <div className="max-w-4xl mx-auto">
         <div className="flex justify-between items-center mb-8">
              <button 
                  onClick={onBack}
                  className="flex items-center gap-2 text-brand-text-muted hover:text-brand-accent group transition-colors duration-200"
              >
                  <Icon id="back" className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
                  Back to Curriculum
              </button>
              <div className="flex items-center gap-2">
                  <button
                      onClick={() => setShareModalOpen(true)}
                      className="flex items-center gap-2 text-brand-text-muted hover:text-brand-accent group transition-colors duration-200 p-2 rounded-md hover:bg-slate-700"
                      title="Share Lesson"
                  >
                      <Icon id="share" className="w-5 h-5" />
                  </button>
                  <button
                      onClick={onToggleFullscreen}
                      className="flex items-center gap-2 text-brand-text-muted hover:text-brand-accent group transition-colors duration-200 p-2 rounded-md hover:bg-slate-700"
                      title={isFullscreen ? "Exit Focus Mode" : "Enter Focus Mode"}
                  >
                      <Icon id={isFullscreen ? 'focus-exit' : 'focus-enter'} className="w-5 h-5" />
                  </button>
              </div>
         </div>


        {lesson.imageUrl && (
          <div className="mb-12 rounded-xl overflow-hidden border-2 border-slate-700/50 shadow-2xl">
              <img src={lesson.imageUrl} alt={lesson.conceptTitle} className="w-full h-auto object-cover" loading="lazy" />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-brand-text">{lesson.conceptTitle}</h1>
        <p className="text-center text-brand-text-muted mb-12">An essential concept for your chosen field.</p>

        <Section title="Introduction" icon="concept">
          {renderContent(lesson.introduction)}
        </Section>

        <Section title="Core Concepts" icon="systems">
          {renderContent(lesson.coreConcepts)}
        </Section>
        
        <Section title="Advanced Topics" icon="advanced">
          {renderContent(lesson.advancedTopics)}
        </Section>

        <Section title="Real-World Analogy" icon="analogy">
           <p className="text-brand-text-muted italic">"{lesson.realWorldAnalogy}"</p>
        </Section>

        {lesson.codeExample && (
          <Section title="Code Example" icon="code">
              <CodeBlock code={lesson.codeExample.code} language={lesson.codeExample.language} />
          </Section>
        )}
        
        <Section title="Common Pitfalls" icon="tool">
          {renderContent(lesson.commonPitfalls)}
        </Section>

        <Section title="Challenge: Your Turn" icon="challenge">
          <h3 className="text-xl font-semibold text-brand-text mb-2">{lesson.challenge.title}</h3>
          <p className="text-brand-text-muted mb-4">{lesson.challenge.description}</p>
          {lesson.challenge.starterCode ? (
              <CodeBlock code={lesson.challenge.starterCode.code} language={lesson.challenge.starterCode.language} />
          ) : (
               <p className="mt-4 text-sm text-cyan-400/80">
                  This challenge is conceptual. Think about the principles and discuss your solution approach in the chat below.
              </p>
          )}
          <p className="mt-4 text-sm text-cyan-400/80">
            Try solving this challenge! You can use the chat below to ask for hints or check your solution.
          </p>
        </Section>

        <ResourceSection title="YouTube Resources" icon="youtube" resources={lesson.youtubeLinks} />
        <ResourceSection title="Online Courses" icon="course" resources={lesson.onlineCourses} />
        <ResourceSection title="Learning Tools" icon="tool" resources={lesson.learningTools} />

        <Section title="Next Steps" icon="next-steps">
           {renderContent(lesson.nextSteps)}
        </Section>
      </div>
    </>
  );
};