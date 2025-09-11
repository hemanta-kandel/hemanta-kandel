export type View = 'learning' | 'playground' | 'journal' | 'community' | 'roadmap';

export interface CodeBlock {
    language: string;
    code: string;
}

export interface Challenge {
  title: string;
  description: string;
  starterCode: CodeBlock | null;
}

export interface ResourceLink {
    title: string;
    url: string;
    description: string;
}

export interface Lesson {
  topicName?: string;
  conceptTitle: string;
  introduction: string;
  coreConcepts: string;
  advancedTopics: string;
  codeExample: CodeBlock | null;
  realWorldAnalogy: string;
  challenge: Challenge;
  nextSteps: string;
  commonPitfalls: string;
  // New fields from AI services
  imageUrl: string;
  youtubeLinks: ResourceLink[];
  onlineCourses: ResourceLink[];
  learningTools: ResourceLink[];
}

export interface ChatMessage {
  sender: 'user' | 'model';
  text: string;
  suggestedQuestions?: string[];
}

export interface CurriculumModule {
  title: string;
  description: string;
}

export interface ProjectIdea {
  title: string;
  description: string;
}

export interface Curriculum {
  beginner: CurriculumModule[];
  intermediate: CurriculumModule[];
  advanced: CurriculumModule[];
  projectIdea: ProjectIdea;
}

export interface LessonNote {
    topicName: string;
    lessonTitle: string;
    chatHistory: ChatMessage[];
    notes: string;
}

// New type for the Community page
export interface ShowcaseProject extends ProjectIdea {
  imageUrl: string;
  topicName: string;
}

// Types for Roadmap Generator
export interface RoadmapResource {
    title: string;
    url: string;
    description: string;
}

export interface RoadmapStep {
    title:string;
    description: string;
    resources: RoadmapResource[];
}

export interface RoadmapStage {
    title: string;
    description: string;
    steps: RoadmapStep[];
}

export interface Roadmap {
    topic: string;
    title: string;
    summary: string;
    stages: RoadmapStage[];
    groundedSources?: any[];
}