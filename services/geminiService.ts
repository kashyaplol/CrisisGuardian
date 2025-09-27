

import { GoogleGenAI, Type } from "@google/genai";
import { DisasterType, DrillStep, DrillStepOption } from '../types';


if (!import.meta.env.VITE_API_KEY) {
  throw new Error("VITE_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

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

const VIDEO_LESSON_PROMPTS: Record<DisasterType, string> = {
  [DisasterType.Earthquake]: `
    Generate a concise 2-4 minute video lesson on Earthquake Safety. The visual style should be clear and authoritative yet reassuring. Use high-quality animation or realistic scenarios. Include text overlays for key points and a professional, calm voiceover. Subtly include the CrisisGuardian logo.

    Title: Earthquake Safety: Drop, Cover, Hold On!

    Content sections:
    1.  **Introduction**: Briefly explain what an earthquake is and why immediate action is crucial.
    2.  **"Drop, Cover, Hold On" Demonstration**: Visually demonstrate and explain each step: Drop to the ground, Cover under a sturdy table or desk, and Hold On until shaking stops.
    3.  **Other Scenarios**: Provide specific visual instructions for being outdoors, in bed, or in a car during an earthquake.
    4.  **After the Shaking**: Advise on checking for injuries and hazards like gas leaks. Show a phone screen with the CrisisGuardian app's 'I Am Safe' feature being used.
    5.  **Preparedness Tip**: End with a quick visual of securing heavy furniture and an emergency kit.
  `,
  [DisasterType.Flood]: `
    Generate a concise 2-4 minute video lesson on Flood Preparedness. The visual style should be clear and authoritative yet reassuring. Use high-quality animation or realistic scenarios. Include text overlays for key points and a professional, calm voiceover. Subtly include the CrisisGuardian logo.

    Title: Flood Preparedness: Rising Waters, Smart Choices

    Content sections:
    1.  **Introduction**: Define different types of floods (flash flood, riverine flood) and their dangers.
    2.  **Before a Flood**: Show visuals for preparing an emergency kit with waterproof containers, planning an evacuation route, and simple property protection like moving valuables higher.
    3.  **During a Flood**: Visually reinforce the "Turn Around, Don't Drown!" message for cars and pedestrians. Show a phone screen with the CrisisGuardian app displaying real-time flood warnings. Illustrate moving to higher ground.
    4.  **After a Flood**: Briefly cover safety tips for returning home, such as checking utilities and being aware of contamination.
  `,
  [DisasterType.Fire]: `
    Generate a concise 2-4 minute video lesson on Fire Emergency safety. The visual style should be clear and authoritative yet reassuring. Use high-quality animation or realistic scenarios. Include text overlays for key points and a professional, calm voiceover. Subtly include the CrisisGuardian logo.

    Title: Fire Emergency: Prevent, Plan, Protect!

    Content sections:
    1.  **Introduction**: Emphasize the speed and danger of fires.
    2.  **Fire Prevention**: Show quick visuals for checking smoke alarm batteries, kitchen safety (not leaving cooking unattended), and avoiding overloaded outlets.
    3.  **Fire Escape Plan**: Animate a family practicing their escape route, emphasizing two ways out and a safe outdoor meeting point.
    4.  **If a Fire Occurs**: Demonstrate crawling low under smoke, the "Stop, Drop, and Roll" technique, and closing doors to slow the fire. The main message should be "Get Out, Stay Out, Call for help!".
  `,
  [DisasterType.Cyclone]: `
    Generate a concise 2-4 minute video lesson on Cyclone and Hurricane preparedness. The visual style should be clear and authoritative yet reassuring. Use high-quality animation or realistic scenarios. Include text overlays for key points and a professional, calm voiceover. Subtly include the CrisisGuardian logo.

    Title: Cyclone Alert: Weathering the Storm

    Content sections:
    1.  **Introduction**: Explain what cyclones are and their impacts (high winds, heavy rain, storm surge).
    2.  **Before the Storm**: Show a phone screen with the CrisisGuardian app tracking a cyclone. Animate securing loose outdoor items and boarding windows. Reiterate the importance of an emergency kit.
    3.  **During the Storm**: Show people safely sheltered in an interior room, away from windows. Emphasize obeying official evacuation orders.
    4.  **After the Storm**: Show post-storm hazards like downed power lines and flooding. The message should be to wait for the official "all-clear" before going outside.
  `
};

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
