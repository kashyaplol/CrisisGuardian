

import { GoogleGenAI, Type } from "@google/genai";
import { DisasterType, DrillStep, DrillStepOption } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    scenario: {
      type: Type.STRING,
      description: "A detailed, immersive paragraph describing a disaster situation unfolding in a school.",
    },
    question: {
        type: Type.STRING,
        description: "A clear, direct question asking the user what their immediate next action should be."
    },
    options: {
      type: Type.ARRAY,
      description: "An array of exactly three possible actions the user can take.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The text of the multiple-choice option.",
          },
          isCorrect: {
            type: Type.BOOLEAN,
            description: "A boolean indicating if this is the correct action.",
          },
          feedback: {
              type: Type.STRING,
              description: "A short explanation of why this option is correct or incorrect."
          }
        },
        required: ["text", "isCorrect", "feedback"],
      },
    },
    aiAdvice: {
        type: Type.STRING,
        description: "A short, concise, and actionable hint for the user if they are stuck on the question. It should guide them toward the correct answer without giving it away directly."
    }
  },
  required: ["scenario", "question", "options", "aiAdvice"],
};

interface PreviousStepContext {
    scenario: string;
    question: string;
    userAnswer: DrillStepOption;
}

export const generateDrillScenario = async (disasterType: DisasterType, region: string, previousStepContext?: PreviousStepContext): Promise<DrillStep | null> => {
  
  let prompt: string;

  if (previousStepContext) {
    const { scenario, question, userAnswer } = previousStepContext;
    prompt = `This is a multi-step disaster drill for a ${disasterType} in a school in ${region}, India, from a student's perspective. 
    The previous situation was: "${scenario}".
    The question asked was: "${question}".
    The user chose the action: "${userAnswer.text}", which was ${userAnswer.isCorrect ? 'correct' : 'incorrect'}. The feedback provided was: "${userAnswer.feedback}".
    Now, generate a new, logical follow-up scenario that results from the user's previous action. Create a new multiple-choice question with three distinct options (one correct, two plausible but incorrect) about the immediate correct action in this new situation. Provide brief feedback for each option. Also, provide a short, concise hint related to this new scenario that helps the user determine the correct next step. Ensure the new scenario is a clear progression of the story.`;
  } else {
    prompt = `Generate a realistic, initial stage disaster scenario for a ${disasterType} in a school located in ${region}, India. The scenario should be focused on a student's perspective. Create one multiple-choice question with three options about the immediate correct action. One option must be correct, and the other two must be plausible but incorrect. Provide brief feedback for each option. Also, provide a short, concise hint to guide the user toward the correct action if they are stuck.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    // Basic validation to ensure the structure matches DrillStep
    if (parsedJson.scenario && parsedJson.question && parsedJson.aiAdvice && Array.isArray(parsedJson.options) && parsedJson.options.length === 3) {
      // Deeper validation for options
      const allOptionsValid = parsedJson.options.every((opt: any) => 
        typeof opt.text === 'string' &&
        typeof opt.isCorrect === 'boolean' &&
        typeof opt.feedback === 'string'
      );
      if (allOptionsValid) {
        return parsedJson as DrillStep;
      }
    }
    
    console.error("Parsed JSON does not match the expected DrillStep structure:", parsedJson);
    return null;

  } catch (error) {
    console.error("Error generating drill scenario:", error);
    return null;
  }
};