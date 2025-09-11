

import React, { useState, useCallback, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { ChatWindow } from './components/ChatWindow';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { CurriculumDisplay } from './components/CurriculumDisplay';
import { CodePlayground } from './components/CodePlayground';
import { Journal } from './Journal';
import { Community } from './components/Community';
import { RoadmapGenerator } from './components/RoadmapGenerator';
import { LessonSkeleton } from './components/LessonSkeleton';
import { generateCurriculum, generateLesson, generateConceptImage, findResources, generateFollowUpQuestions } from './services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { TOPICS } from './constants';
import type { Lesson, ChatMessage, Curriculum, LessonNote, View, Roadmap } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('learning');
  const [selectedTopic, setSelectedTopic] = useState<{name: string, isProgramming: boolean} | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [journal, setJournal] = useState<LessonNote[]>([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState<Roadmap[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState<boolean>(false);
  const [isLoadingLesson, setIsLoadingLesson] = useState<boolean>(false);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

  useEffect(() => {
    try {
      const savedTopic = localStorage.getItem('selectedTopic');
      const savedCurriculum = localStorage.getItem('curriculum');
      const savedCompleted = localStorage.getItem('completedLessons');
      const savedJournal = localStorage.getItem('journal');
      const savedRoadmapsData = localStorage.getItem('savedRoadmaps');
      
      if (savedTopic) setSelectedTopic(JSON.parse(savedTopic));
      if (savedCurriculum) setCurriculum(JSON.parse(savedCurriculum));
      if (savedCompleted) setCompletedLessons(JSON.parse(savedCompleted));
      if (savedJournal) setJournal(JSON.parse(savedJournal));
      if (savedRoadmapsData) setSavedRoadmaps(JSON.parse(savedRoadmapsData));

    } catch (e) {
      console.error("Failed to load state from localStorage", e);
      localStorage.clear();
    }
  }, []);

  useEffect(() => {
    try {
      if (selectedTopic) localStorage.setItem('selectedTopic', JSON.stringify(selectedTopic));
      else localStorage.removeItem('selectedTopic');
      
      if (curriculum) localStorage.setItem('curriculum', JSON.stringify(curriculum));
      else localStorage.removeItem('curriculum');
      
      localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
      localStorage.setItem('journal', JSON.stringify(journal));
      localStorage.setItem('savedRoadmaps', JSON.stringify(savedRoadmaps));

    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }, [selectedTopic, curriculum, completedLessons, journal, savedRoadmaps]);

  const handleSetView = (view: View) => {
    if ((view === 'learning' || view === 'journal') && !selectedTopic) return;
    setCurrentView(view);
  }

  const resetState = (clearTopic = false) => {
    if (clearTopic) {
      setSelectedTopic(null);
      localStorage.clear();
    }
    setCurriculum(null);
    setLesson(null);
    setChatHistory([]);
    setChatInstance(null);
    setCompletedLessons([]);
    setJournal([]);
    setSavedRoadmaps([]);
    setError(null);
    setCurrentView('learning');
    setIsFullscreen(false);
  };

  const handleSelectTopic = useCallback(async (topicName: string) => {
    if (isLoadingCurriculum || !ai) return;

    const topicData = TOPICS.find(t => t.name === topicName);
    if (!topicData) {
        setError("Selected topic not found.");
        return;
    }
    
    resetState();
    setSelectedTopic({ name: topicData.name, isProgramming: topicData.isProgramming });
    setIsLoadingCurriculum(true);

    try {
      const newCurriculum = await generateCurriculum(topicData.name, topicData.isProgramming);
      setCurriculum(newCurriculum);
    } catch (err) {
      console.error("Failed to generate curriculum:", err);
      setError("Sorry, I couldn't generate the curriculum. Please check your API key or try again later.");
    } finally {
      setIsLoadingCurriculum(false);
    }
  }, [isLoadingCurriculum, ai]);

  const handleSelectLesson = useCallback(async (lessonTitle: string, fromJournalTopicName?: string) => {
    const topic = fromJournalTopicName ? TOPICS.find(t => t.name === fromJournalTopicName) : TOPICS.find(t => t.name === selectedTopic?.name);

    if (isLoadingLesson || !topic || !ai) return;

    if (!fromJournalTopicName) {
      setCurrentView('learning');
    }

    setIsLoadingLesson(true);
    setLesson(null);
    setChatHistory([]);
    setChatInstance(null);
    setError(null);

    try {
        const [lessonResult, imageResult, resourcesResult] = await Promise.allSettled([
            generateLesson(topic.name, lessonTitle, topic.isProgramming),
            generateConceptImage(topic.name, lessonTitle),
            findResources(topic.name, lessonTitle)
        ]);

        if(lessonResult.status === 'rejected') throw new Error(`Failed to generate lesson content: ${lessonResult.reason}`);
        
        const newLesson: Lesson = { 
            ...lessonResult.value,
            topicName: topic.name,
            imageUrl: imageResult.status === 'fulfilled' ? imageResult.value : '',
            ...(resourcesResult.status === 'fulfilled' ? resourcesResult.value : { youtubeLinks: [], onlineCourses: [], learningTools: [] })
        };
        
        setLesson(newLesson);

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: `You are a helpful and expert tutor specializing in ${topic.name}. The user is currently learning about "${newLesson.conceptTitle}". Your goal is to help them understand the concept, code, and challenge. Be encouraging, clear, and provide practical examples. Refer to the lesson content when relevant.`,
            }
        });
        setChatInstance(chat);

        const initialMessage: ChatMessage = { sender: 'model', text: `Let's dive into ${newLesson.conceptTitle}! What's your first question?` };
        setChatHistory([initialMessage]);
        
        setJournal(prevJournal => {
          const existingNoteIndex = prevJournal.findIndex(note => note.lessonTitle === lessonTitle && note.topicName === topic.name);
          if (existingNoteIndex === -1) {
            return [...prevJournal, { topicName: topic.name, lessonTitle, chatHistory: [initialMessage], notes: '' }];
          }
          return prevJournal;
        });

    } catch (err) {
      console.error("Failed to generate lesson:", err);
      setError("Sorry, I couldn't generate the lesson for this topic. Please try another one.");
    } finally {
      setIsLoadingLesson(false);
    }
  }, [isLoadingLesson, selectedTopic, ai]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatInstance || isSendingMessage || !lesson) return;

    setIsSendingMessage(true);
    
    const userMessage: ChatMessage = { sender: 'user', text: message };
    const historyWithUserMessage = [...chatHistory, userMessage];
    setChatHistory(historyWithUserMessage);

    try {
      const stream = await chatInstance.sendMessageStream({ message });
      let modelResponse = '';
      const modelMessageIndex = historyWithUserMessage.length;
      
      setChatHistory(prev => {
          const newHistory = [...prev];
          if (newHistory.length > 1) {
            delete newHistory[newHistory.length - 2].suggestedQuestions;
          }
          return [...newHistory, { sender: 'model', text: '...' }];
      });
      
      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[modelMessageIndex] = { sender: 'model', text: modelResponse };
          return newHistory;
        });
      }
      
      const finalModelMessage: ChatMessage = { sender: 'model', text: modelResponse };
      const contextForQuestions: ChatMessage[] = [...historyWithUserMessage, finalModelMessage];
      const suggestedQuestions = await generateFollowUpQuestions(contextForQuestions);
      
      setChatHistory(prev => {
          const newHistory = [...prev];
          if (newHistory[modelMessageIndex]) {
            newHistory[modelMessageIndex] = { ...finalModelMessage, suggestedQuestions };
          }
          return newHistory;
      });

    } catch (err) {
      console.error("Failed to send message:", err);
      const modelMessageIndex = historyWithUserMessage.length;
      setChatHistory(prev => {
          const newHistory = [...prev];
          if(newHistory[modelMessageIndex]) {
            newHistory[modelMessageIndex] = { sender: 'model', text: "I encountered an error. Please try asking again." };
          }
          return newHistory;
      });
    } finally {
      setIsSendingMessage(false);
    }
  }, [chatInstance, chatHistory, isSendingMessage, lesson]);

  const handleBackToCurriculum = () => {
      if(lesson && selectedTopic) {
        if (!completedLessons.includes(lesson.conceptTitle)) {
          setCompletedLessons(prev => [...prev, lesson.conceptTitle]);
        }
        setJournal(prevJournal => {
          const noteIndex = prevJournal.findIndex(note => note.lessonTitle === lesson.conceptTitle && note.topicName === selectedTopic.name);
          if (noteIndex > -1) {
            const updatedJournal = [...prevJournal];
            updatedJournal[noteIndex].chatHistory = chatHistory;
            return updatedJournal;
          }
          return prevJournal;
        });
      }
      setLesson(null);
      setChatInstance(null);
      setChatHistory([]);
      setError(null);
  }

  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  const renderMainArea = () => {
    if (error) {
        return <div className="text-red-400 text-center p-8">{error}</div>;
    }
    switch (currentView) {
      case 'playground':
        return <CodePlayground isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'roadmap':
        return <RoadmapGenerator savedRoadmaps={savedRoadmaps} setSavedRoadmaps={setSavedRoadmaps} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'journal':
        return <Journal journal={journal} setJournal={setJournal} onSelectLesson={handleSelectLesson} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'community':
        return <Community isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'learning':
      default:
        if (isLoadingCurriculum) {
          return <div className="flex items-center justify-center h-full"><LoadingSpinner text="Forging your learning path..." /></div>;
        }
        if (isLoadingLesson) {
            return <LessonSkeleton />;
        }
        if (lesson) {
            return <MainContent lesson={lesson} onBack={handleBackToCurriculum} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
        }
        if (curriculum && selectedTopic) {
          return <CurriculumDisplay 
            curriculum={curriculum} 
            onSelectLesson={handleSelectLesson} 
            topicName={selectedTopic.name}
            completedLessons={completedLessons}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            />;
        }
        return <WelcomeScreen onSelectTopic={handleSelectTopic} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-brand-primary">
      {!isFullscreen && (
        <Sidebar 
          currentView={currentView}
          onSetView={handleSetView}
          selectedTopic={selectedTopic?.name || null} 
          onReset={() => resetState(true)}
        />
      )}
      <main className="flex-1 grid grid-rows-[1fr_auto] h-screen overflow-hidden">
        <div className={`flex-1 overflow-y-auto ${isFullscreen ? 'p-2' : 'p-4 md:p-8'}`}>
          {renderMainArea()}
        </div>
        {currentView === 'learning' && lesson && chatInstance && !isFullscreen && (
          <div className="border-t border-slate-700 bg-brand-secondary/50">
            <ChatWindow
              history={chatHistory}
              onSendMessage={handleSendMessage}
              isSendingMessage={isSendingMessage}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;