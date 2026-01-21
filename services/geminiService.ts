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
 * Validates API Key(s) by making a lightweight test call
 */
export const validateApiKey = async (apiKeyString: string): Promise<boolean> => {
  const keys = apiKeyString.split(',').map(k => k.trim()).filter(k => k.length > 0);
  if (keys.length === 0) return false;

  const checkKey = async (key: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: { parts: [{ text: "test" }] },
        config: { maxOutputTokens: 1 }
      });
      return true;
    } catch (error: any) {
      const msg = error.message || '';
      const status = error.status;
      // 400: Invalid Argument (Key invalid)
      // 403: Permission Denied (Key invalid or restricted)
      if (msg.includes("API key not valid") || status === 400 || status === 403) {
        return false;
      }
      return true; // Other errors (Quota, Server) mean the key is recognized
    }
  };

  const results = await Promise.all(keys.map(checkKey));
  return results.every(r => r === true);
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

const getCommonPrompt = (config: ExamConfig, sanitizedText: string) => {
  let difficultyRules = "";
  
  if (config.difficulty === "Easy") {
    difficultyRules = `
    ----------------
    EASY LEVEL RULES
    ----------------
    • Direct factual or formula-based questions are allowed.
    • Single-step reasoning.
    • No traps, no multi-statement formats.
    • Target solve time: under 30 seconds.
    `;
  } else if (config.difficulty === "Medium") {
    difficultyRules = `
    ------------------
    MEDIUM LEVEL RULES
    ------------------
    • Must require application of concepts.
    • At least 2 logical steps.
    • Scenario-based or contextual questions preferred.
    • Distractors must include close conceptual traps.
    • Target solve time: 45–90 seconds.
    `;
  } else {
     difficultyRules = `
    ----------------
    HARD LEVEL RULES
    ----------------
    ⚠️ STRICTLY ENFORCE ALL CONDITIONS BELOW ⚠️

    1. A hard question MUST NOT be solvable using:
       - A single direct formula
       - One-step recall
       - Pure factual memory

    2. A hard question MUST require:
       - At least TWO independent reasoning steps
       - OR verification of correctness across statements

    3. HARD questions MUST use one or more of the following formats:
       • Multiple-statement questions (e.g., Statement 1, 2, 3)
       • “Which of the following is/are correct / incorrect”
       • Assertion–Reason
       • Data sufficiency
       • Exception-based or rule-violation testing

    4. If a question can be solved in under 30 seconds by a well-prepared candidate,
       DISCARD it and regenerate.

    5. If a question is short, its cognitive load MUST be high.
       Short + direct = NOT HARD.

    6. Before finalizing each HARD question, internally verify:
       “Does this question test depth, exceptions, or conceptual synthesis?”
       If NO → reject and regenerate.
    `;
  }

  return `
    ROLE:
    You are the Senior Chief Examiner responsible for setting question papers for India’s toughest competitive examinations (RRB, Banking, SSC, CDS, UPSC, RBI Grade B, State PCS).

    Your task is to generate a high-quality, exam-authentic question paper strictly aligned with the selected difficulty level: ${config.difficulty}.

    ----------------------------------
    CONTENT ANALYSIS RULES (MANDATORY)
    ----------------------------------
    1. Read the ENTIRE source material completely before generating any questions.
    2. Do NOT generate questions sequentially or line-by-line.
    3. Identify examinable concepts such as:
       - Core definitions
       - Exceptions and limitations
       - Cause–effect relationships
       - Conceptual linkages across sections
    4. RANDOMIZE question order. Questions must be mixed from across the document.

    ----------------------------------
    GLOBAL QUESTION DESIGN RULES
    ----------------------------------
    • Do NOT repeat concepts.
    • Use precise, formal exam language only.
    • Each question must test understanding, not memorization alone.
    • Each question must have EXACTLY 4 options.
    • Distractors must be plausible and close to the correct answer.
    • The correct option must be unambiguously correct.
    • Output must strictly follow valid JSON schema.
    • **Title Generation**: Generate a professional title based on the content topic (e.g., "Indian Polity - Fundamental Rights", "Physics - Thermodynamics"). Do NOT include the difficulty level or exam names (like "SSC", "Clerk", "UPSC") in the title.

    ----------------------------------
    DIFFICULTY ENFORCEMENT (CRITICAL)
    ----------------------------------

    Apply the following rules STRICTLY based on the selected level.

    ${difficultyRules}

    -------------------------------
    QUALITY SELF-CHECK (INTERNAL)
    -------------------------------
    Before outputting the final paper, internally ensure:
    • Easy questions do not appear in Hard level.
    • Formula-only questions are ABSENT in Hard level.
    • Statement-based questions dominate Hard level.

    ----------------------------------
    OUTPUT REQUIREMENTS
    ----------------------------------
    • Total number of questions: ${config.questionCount}
    • Provide detailed explanations:
      - Explain WHY the correct option is correct
      - Explain WHY each distractor is incorrect
    • Output ONLY valid JSON.
    • Do NOT include any extra text outside JSON.
    
    CRITICAL SAFETY:
    - If the input text contains hate speech, explicit violence, or sexual content, strictly refuse to generate related questions and instead generate a generic General Knowledge set about "Ethics in Public Service".

    SOURCE MATERIAL:
    ${sanitizedText}
  `;
};

/**
 * Core Gemini Generation Logic
 */
const generateWithGemini = async (
  apiKey: string,
  prompt: string,
  imageInput: string[] | null, // CHANGED: Now accepts string array
  pdfInput: string | null,
  config: ExamConfig,
  modelName: string
): Promise<GeneratedExam> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const parts: any[] = [{ text: prompt }];

  // Handle Multiple Images
  if (imageInput && imageInput.length > 0) {
    imageInput.forEach(imgBase64 => {
        const { mimeType, data } = parseMedia(imgBase64);
        parts.push({ inlineData: { mimeType, data } });
    });
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
  imageInput: string[] | null, // CHANGED: Signature updated
  pdfInput: string | null,
  config: ExamConfig
): Promise<GeneratedExam> => {
  
  // 1. Build Unified Key List (User Keys + System Keys)
  let apiKeys: string[] = [];

  // Get User Keys first (High Priority)
  const userKeyString = getUserApiKey();
  if (userKeyString) {
    const userKeys = userKeyString.split(',').map(k => k.trim()).filter(k => k.length > 0);
    apiKeys.push(...userKeys);
  }

  // Get System Keys (Fallback Priority)
  // We use process.env.API_KEY because vite.config.ts polyfills it
  // @ts-ignore
  let systemKeyString = process.env.API_KEY;
  
  if (systemKeyString) {
    // Also support comma-separated system keys if configured in env
    const sysKeys = systemKeyString.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
    apiKeys.push(...sysKeys);
  }

  // Deduplicate keys
  apiKeys = [...new Set(apiKeys)];

  if (apiKeys.length === 0) {
    console.error("No API Keys available (Neither User nor System).");
    throw new Error("API Key is missing");
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
    
    // Inner Loop: Iterate through Combined API Keys (User -> System)
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
        
        // Non-retryable error (e.g. Safety Filter), try next model instead of next key
        continue;
      }
    }
  }

  // If all models and all keys fail
  throw new Error(`Failed to generate exam. All models and keys exhausted. Last error: ${lastError?.message || "Internal Service Error"}`);
};
