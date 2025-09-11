

import { GoogleGenAI, Type } from "@google/genai";
import type { Lesson, Curriculum, ResourceLink, ChatMessage, ProjectIdea, Roadmap } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set it in your environment.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const projectIdeaSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A creative and inspiring title for a capstone project." },
        description: { type: Type.STRING, description: "A detailed, one-paragraph description of the project, outlining its goals and key features." }
    },
    required: ['title', 'description']
};

const curriculumModuleSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A concise, specific title for a lesson." },
        description: { type: Type.STRING, description: "A brief, one-sentence summary of the lesson." }
    },
    required: ['title', 'description']
};

const curriculumSchema = {
    type: Type.OBJECT,
    properties: {
        beginner: { type: Type.ARRAY, description: "Array of 5-7 beginner lesson modules.", items: curriculumModuleSchema },
        intermediate: { type: Type.ARRAY, description: "Array of 5-7 intermediate lesson modules.", items: curriculumModuleSchema },
        advanced: { type: Type.ARRAY, description: "Array of 5-7 advanced lesson modules.", items: curriculumModuleSchema },
        projectIdea: projectIdeaSchema
    },
    required: ['beginner', 'intermediate', 'advanced', 'projectIdea']
};

const codeBlockSchema = {
    type: Type.OBJECT,
    properties: {
        language: { type: Type.STRING, description: "The programming language of the code snippet (e.g., 'python', 'javascript')." },
        code: { type: Type.STRING, description: 'A complete, well-commented code snippet.' },
    },
    required: ['language', 'code'],
    nullable: true,
};

const lessonContentSchema = {
  type: Type.OBJECT,
  properties: {
    conceptTitle: { type: Type.STRING, description: 'Concise title for the lesson, matching the requested title.' },
    introduction: { type: Type.STRING, description: 'An engaging introduction explaining the "what" and "why" of the concept. Formatted with well-formed Markdown.' },
    coreConcepts: { type: Type.STRING, description: 'A vast, deep dive into the fundamental principles, using Markdown (subheadings, lists, bolding) for clarity.' },
    advancedTopics: { type: Type.STRING, description: 'A section on advanced applications, edge cases, or complex related theories, using Markdown.' },
    codeExample: codeBlockSchema,
    realWorldAnalogy: { type: Type.STRING, description: "A simple, real-world analogy." },
    commonPitfalls: { type: Type.STRING, description: "A list of common mistakes or misconceptions learners face, using a Markdown list." },
    challenge: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Title for a challenge.' },
        description: { type: Type.STRING, description: 'Description of the challenge.' },
        starterCode: codeBlockSchema
      },
      required: ['title', 'description', 'starterCode']
    },
    nextSteps: { type: Type.STRING, description: "Suggestions for what to learn next, using a Markdown list." }
  },
  required: ['conceptTitle', 'introduction', 'coreConcepts', 'advancedTopics', 'codeExample', 'realWorldAnalogy', 'commonPitfalls', 'challenge', 'nextSteps']
};

export const generateCurriculum = async (topic: string, isProgramming: boolean): Promise<Curriculum> => {
  const languageContext = isProgramming ? "The learning curriculum should focus on practical coding skills, primarily using Python unless another language is more suitable (e.g., Swift for iOS). " : "The curriculum should focus on concepts, theory, and real-world applications. Do NOT focus on coding. ";
  const prompt = `Create a comprehensive, structured learning curriculum for "${topic}". ${languageContext}The curriculum must be divided into Beginner, Intermediate, and Advanced sections, each with 5-7 specific lesson titles and descriptions. Also, provide a compelling capstone project idea.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: curriculumSchema },
  });
  return JSON.parse(response.text) as Curriculum;
};

export const generateLesson = async (topic: string, lessonTitle: string, isProgramming: boolean): Promise<Lesson> => {
    const prompt = `As an expert educator specializing in "${topic}", create an in-depth, comprehensive learning module for the lesson titled "${lessonTitle}".

Your response must be structured to take a learner from a beginner to an advanced understanding within this single lesson. The content should be vast, knowledgeable, and exceptionally clear. 

**Topic Type:** ${isProgramming ? 'Programming-focused' : 'Concept-focused'}

**Instructions:**
- **If this is a programming topic:** Provide a relevant code example and a challenge with starter code. Use an appropriate language (e.g., Python for data science, JavaScript for web dev).
- **If this is a concept-focused topic:** The \`codeExample\` and the challenge's \`starterCode\` fields in the JSON **must be null**. Focus on theory, history, and real-world impact. Do not provide code.

**Formatting Rules:**
- Use very clear, well-structured Markdown.
- Use shorter paragraphs for better readability.
- **Crucially, separate all paragraphs, lists, and headings with a single blank line.**
- Use bulleted lists (e.g., \`* list item\`) for enumerations.
- Bold key terms using \`**term**\`.
- Use \`###\` for subheadings.

The JSON output should strictly follow the provided schema. Ensure all Markdown content is well-formed.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: lessonContentSchema },
    });
    return JSON.parse(response.text) as Lesson;
};

export const findResources = async (topic: string, lessonTitle: string) => {
    const prompt = `Find learning resources for a person studying "${lessonTitle}" in the field of "${topic}". Provide links for YouTube videos, online courses, and relevant software tools. 
    Respond ONLY with a single valid JSON object inside a markdown block like this:
    \`\`\`json
    {
        "youtubeLinks": [],
        "onlineCourses": [],
        "learningTools": []
    }
    \`\`\`
    Each key should be an array of objects, where each object has "title", "url", and "description" string properties. Populate the arrays with 2-3 relevant items for each category.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });
    
    let resources: { youtubeLinks: ResourceLink[], onlineCourses: ResourceLink[], learningTools: ResourceLink[] } = {
        youtubeLinks: [],
        onlineCourses: [],
        learningTools: [],
    };

    try {
        let text = response.text.trim();
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            text = jsonMatch[1];
        }
        resources = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON from findResources response:", e, "Raw text:", response.text);
    }
    
    const groundedSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundedSources) {
        const existingUrls = new Set([
            ...(resources.youtubeLinks || []).map(r => r.url),
            ...(resources.onlineCourses || []).map(r => r.url),
            ...(resources.learningTools || []).map(r => r.url),
        ]);

        groundedSources.forEach(source => {
            if (source.web && source.web.uri && !existingUrls.has(source.web.uri)) {
                if (!resources.learningTools) resources.learningTools = [];
                resources.learningTools.push({
                    title: `[Source] ${source.web.title || source.web.uri}`,
                    url: source.web.uri,
                    description: "Grounded search result from Google."
                });
                existingUrls.add(source.web.uri);
            }
        });
    }
    return resources;
};

export const generateConceptImage = async (topic: string, conceptTitle: string): Promise<string> => {
    const prompt = `A photorealistic, visually stunning, abstract, artistic image representing the concept of "${conceptTitle}" in the context of "${topic}". Style: futuristic, clean lines, vibrant blues and cyans against a dark background. Atmosphere: minimalist, evocative, and high-tech. Use cinematic lighting and a high-resolution, detailed rendering.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001', prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
    });
    const base64Image = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64Image}`;
};

const projectShowcaseSchema = {
    type: Type.ARRAY,
    description: "An array of 4 diverse and inspiring capstone project ideas.",
    items: projectIdeaSchema
};

export const generateProjectShowcase = async (topic: string): Promise<ProjectIdea[]> => {
    const prompt = `Generate 4 diverse and inspiring capstone project ideas for the topic "${topic}". The projects should range in complexity but all be substantial. For each project, provide a title and a compelling description.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: projectShowcaseSchema },
    });
    return JSON.parse(response.text) as ProjectIdea[];
};

export const runCode = async (language: string, code: string): Promise<string> => {
    const prompt = `You are a code execution simulator. The user has provided the following ${language} code. Do not actually execute it. Instead, analyze the code and provide a response in a JSON object with two keys: "output" and "explanation".
    - In "output", describe the expected standard output as if the code were run.
    - In "explanation", briefly explain what the code does, step-by-step.
    
    Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    `;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return response.text;
};

export const generateFollowUpQuestions = async (chatHistory: ChatMessage[]): Promise<string[]> => {
    const context = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    const prompt = `Based on this conversation history, generate 3 concise, relevant follow-up questions a learner might ask next.
    
Conversation:
${context}

Respond ONLY with a JSON array of strings. Example: ["What about X?", "How does Y relate to Z?", "Can you explain W in simpler terms?"]`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
        });
        return JSON.parse(response.text) as string[];
    } catch(e) {
        console.error("Failed to generate follow-up questions:", e);
        return [];
    }
};

export const generateRoadmap = async (topic: string): Promise<Roadmap> => {
    const prompt = `You are an expert curriculum designer and career advisor. Generate a comprehensive, step-by-step learning roadmap for the topic: "${topic}".

Your response must be a single valid JSON object inside a markdown block.

The roadmap should include:
1.  **topic**: The user's original requested topic.
2.  **title**: A creative and inspiring title for the roadmap.
3.  **summary**: A brief, encouraging one-paragraph summary of the learning journey.
4.  **stages**: An array of 3-5 logical stages (e.g., "Phase 1: Foundations", "Phase 2: Core Skills", "Phase 3: Advanced Applications"). Each stage must have:
    - **title**: The title of the stage.
    - **description**: A short paragraph explaining the goals of this stage.
    - **steps**: An array of 3-5 specific, actionable learning steps. Each step must have:
        - **title**: A concise title for the step (e.g., "Understand HTML Basics").
        - **description**: A detailed paragraph explaining what to learn and why it's important.
        - **resources**: An array of 2-4 high-quality online resources. Use Google Search to find relevant and up-to-date links. Each resource must have:
            - **title**: The title of the resource.
            - **url**: The direct URL to the resource.
            - **description**: A brief sentence explaining what the resource is (e.g., "A comprehensive video tutorial.", "Official documentation.").

Example JSON structure:
\`\`\`json
{
  "topic": "${topic}",
  "title": "The Full-Stack Web Developer's Odyssey",
  "summary": "Embark on an epic journey to master the art of web development...",
  "stages": [
    {
      "title": "Phase 1: The Frontend Foundation",
      "description": "In this phase, you will build the bedrock of your web development skills...",
      "steps": [
        {
          "title": "Mastering HTML & CSS",
          "description": "HTML provides the structure of web pages, while CSS styles them...",
          "resources": [
            {
              "title": "MDN Web Docs: HTML",
              "url": "https://developer.mozilla.org/en-US/docs/Web/HTML",
              "description": "The definitive guide to HTML."
            },
            {
              "title": "freeCodeCamp: Responsive Web Design",
              "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
              "description": "An interactive course covering HTML and CSS."
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

Provide a complete and well-structured JSON response.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    let roadmap: Roadmap;
    try {
        let text = response.text.trim();
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            text = jsonMatch[1];
        }
        roadmap = JSON.parse(text) as Roadmap;
    } catch (e) {
        console.error("Failed to parse JSON from generateRoadmap response:", e, "Raw text:", response.text);
        throw new Error("Failed to generate a valid roadmap. The AI response was not in the expected format.");
    }

    const groundedSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundedSources) {
        roadmap.groundedSources = groundedSources;
    }

    return roadmap;
};