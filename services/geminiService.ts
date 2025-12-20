import { GoogleGenAI, Type } from "@google/genai";
import { ExamConfig, GeneratedExam, Question } from "../types";

const MAX_TEXT_CHARS = 80000;
export const USER_API_KEY_STORAGE = 'note2exam_user_api_key';

/**
 * User API Key Management
 */
export const saveUserApiKey = (key: string) => localStorage.setItem(USER_API_KEY_STORAGE, key);
export const removeUserApiKey = () => localStorage.removeItem(USER_API_KEY_STORAGE);
export const getUserApiKey = () => localStorage.getItem(USER_API_KEY_STORAGE);
export const hasUserApiKey = () => !!localStorage.getItem(USER_API_KEY_STORAGE);

/**
 * Helper function to wait for a specific amount of time (Retry Backoff)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to securely retrieve the Gemini API Key(s)
 * Prioritizes User Key -> System Env Key
 * Returns a raw string (potentially comma-separated)
 */
const getApiKey = (): string | undefined => {
  const userKey = getUserApiKey();
  if (userKey) return userKey;

  // In Vercel + Vite (with define plugin), process.env.API_KEY is replaced 
  // with the actual environment variable value at build time.
  return process.env.API_KEY;
};

/**
 * Parses base64 strings to identify MIME type and extract raw data
 */
const parseMedia = (base64String: string) => {
  if (base64String.startsWith('data:')) {
    const commaIndex = base64String.indexOf(',');
    if (commaIndex !== -1) {
      const semicolonIndex = base64String.indexOf(';');
      const mimeType = base64String.substring(5, semicolonIndex);
      const data = base64String.substring(commaIndex + 1);
      return { mimeType, data };
    }
  }
  return {
    mimeType: "application/pdf", 
    data: base64String
  };
};

const getDifficultyInstructions = (difficulty: string) => {
  const instructions = {
    "Easy": "Questions should focus on basic facts and definitions found in the text. Language should be simple and direct. The length of questions and options should be concise.",
    "Medium": "Questions should require conceptual understanding and application of knowledge. Focus on 'how' and 'why' rather than just 'what'. Options should include plausible distractors that test comprehension.",
    "Hard": "Questions should involve complex reasoning, multi-step analysis, or synthesis of multiple concepts from the text. Use technical terminology and sophisticated academic language. Questions and options should be significantly longer and more detailed to challenge the candidate's deep mastery."
  };
  return instructions[difficulty as keyof typeof instructions] || instructions["Medium"];
};

const getCommonPrompt = (config: ExamConfig, sanitizedText: string) => {
  return `
    Act as a senior academic professor and expert exam setter. Generate a professional CBT exam based on the provided content.
    
    CRITICAL SAFETY RULES:
    - DO NOT generate questions that include hate speech, explicit language, sexual content, violence, or harassment.
    - If the input content contains inappropriate language, REJECT it and generate a standard academic exam on ethics instead.
    
    Difficulty Configuration:
    - Current Setting: ${config.difficulty}
    - Guidelines: ${getDifficultyInstructions(config.difficulty)}
    
    Structural Requirements:
    - Number of Questions: ${config.questionCount}
    - Format: 4 options. Return pure text for each option. DO NOT include prefixes like "A)", "B)", "1.", etc. in the option strings.
    - Rationales: Provide detailed educational explanations for the correct answers.
    - Output: Strict JSON format matching the schema provided.
    
    Content Context:
    ${sanitizedText}
  `;
};

/**
 * Core Gemini Generation Logic
 */
const generateWithGemini = async (
  apiKey: string,
  prompt: string,
  imageInput: string | null,
  pdfInput: string | null,
  config: ExamConfig,
  modelName: string
): Promise<GeneratedExam> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const parts: any[] = [{ text: prompt }];

  if (imageInput) {
    const { mimeType, data } = parseMedia(imageInput);
    parts.push({ inlineData: { mimeType, data } });
  }

  if (pdfInput) {
    const { data } = parseMedia(pdfInput);
    parts.push({ inlineData: { mimeType: "application/pdf", data } });
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                topic: { type: Type.STRING }
              },
              required: ["id", "text", "options", "correctAnswerIndex", "explanation", "topic"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  if (response.text) {
    const result = JSON.parse(response.text);
    return {
      title: result.title || "Generated Exam",
      questions: result.questions.map((q: any, idx: number) => ({ ...q, id: idx + 1 })),
      config: config
    };
  }
  throw new Error("Empty AI response from Gemini");
};

/**
 * Main Exam Generation Function with Automatic Model Cascading & Multi-Key Rotation
 */
export const generateExamContent = async (
  textInput: string,
  imageInput: string | null,
  pdfInput: string | null,
  config: ExamConfig
): Promise<GeneratedExam> => {
  
  const rawKeyString = getApiKey();
  
  if (!rawKeyString) {
    console.error("API Key is missing.");
    throw new Error("API Key is missing");
  }

  // Parse Multi-Keys (Handle comma separation)
  const apiKeys = rawKeyString.split(',').map(k => k.trim()).filter(k => k.length > 0);

  if (apiKeys.length === 0) {
    throw new Error("No valid API keys found");
  }

  const sanitizedText = textInput.length > MAX_TEXT_CHARS 
    ? textInput.substring(0, MAX_TEXT_CHARS) + "... [truncated]" 
    : textInput;

  const prompt = getCommonPrompt(config, sanitizedText);

  // Cascading Strategy: 
  // 1. Gemini 3.0 Flash Preview (Smartest/Fastest)
  // 2. Gemini 2.5 Flash (Stable Backup)
  // 3. Gemini 2.5 Flash Lite (Lightweight Backup)
  // 4. Gemini 1.5 Flash (Ultimate Safety Net)
  const MODEL_CASCADE = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash", 
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash"
  ];

  let lastError: any;

  // Outer Loop: Iterate through Models (Quality Priority)
  for (const modelName of MODEL_CASCADE) {
    
    // Inner Loop: Iterate through API Keys (Robustness Priority)
    for (const apiKey of apiKeys) {
      try {
        console.log(`Attempting generation with model: ${modelName} using key ending in ...${apiKey.slice(-4)}`);
        return await generateWithGemini(apiKey, prompt, imageInput, pdfInput, config, modelName);
      } catch (error: any) {
        lastError = error;
        
        const errorMsg = error.message || "";
        const status = error.status;

        console.warn(`Model ${modelName} failed with key ...${apiKey.slice(-4)}:`, errorMsg);
        
        // Define retryable conditions (Rate Limit, Quota, Overloaded)
        const isRetryable = errorMsg.includes("503") || 
                            errorMsg.includes("overloaded") || 
                            errorMsg.includes("429") ||
                            errorMsg.includes("quota") ||
                            errorMsg.includes("exhausted") ||
                            status === 503 ||
                            status === 429;
        
        // Also catch invalid key errors to auto-switch
        const isInvalidKey = errorMsg.includes("API key not valid") || status === 400;

        if (isRetryable || isInvalidKey) {
           // Continue to next Key
           continue;
        }
        
        // If it's a prompt error (Safety filter, Bad Request unrelated to key), we might want to stop
        // But for robustness, we often continue to the next model just in case.
        continue;
      }
    }
  }

  // If all models and all keys fail
  throw new Error(`Failed to generate exam. All models and keys exhausted. Last error: ${lastError?.message || "Internal Service Error"}`);
};
