import { GoogleGenAI, Type } from "@google/genai";
import { DisasterType, DrillStep, DrillStepOption, DrillMode, VideoStyle } from '../types';


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
    stepsSurvived?: number;
}

export const generateDrillScenario = async (disasterType: DisasterType, region: string, mode: DrillMode, previousStepContext?: PreviousStepContext): Promise<DrillStep | null> => {
  
  let prompt: string;
  const studentFocus = "All scenarios and options must be easy for a school student in India to understand.";

  if (previousStepContext) {
    const { scenario, question, userAnswer, stepsSurvived } = previousStepContext;
    if (mode === 'Survival') {
       prompt = `This is a continuous SURVIVAL MODE disaster drill about a ${disasterType} in a school in ${region}, India. The user has correctly survived ${stepsSurvived} scenarios so far.
       The previous situation was: "${scenario}".
       The user correctly chose the action: "${userAnswer.text}".
       Now, generate the NEXT logical follow-up scenario in this evolving story. The situation should become slightly more intense or complex, but still be a direct consequence of the previous events. Create a new question and three options (one correct, two incorrect). Ensure the entire scenario is from a student's perspective. ${studentFocus}`;
    } else { // Standard Mode
        prompt = `This is a multi-step standard disaster drill for a ${disasterType} in a school in ${region}, India.
        The previous situation was: "${scenario}".
        The question asked was: "${question}".
        The user chose the action: "${userAnswer.text}", which was ${userAnswer.isCorrect ? 'correct' : 'incorrect'}. The feedback provided was: "${userAnswer.feedback}".
        Now, generate a new, logical follow-up scenario that results from the user's previous action. Create a new multiple-choice question with three distinct options about the immediate correct action. ${studentFocus}`;
    }
  } else { // First step of any drill
    const modeDescription = mode === 'Survival' ? 'This is the START of a continuous SURVIVAL MODE drill.' : 'This is the START of a standard, multi-step drill.';
    prompt = `Generate a realistic, initial stage disaster scenario for a ${disasterType} in a school located in ${region}, India. ${modeDescription} The scenario should be focused on a student's perspective. Create one multiple-choice question with three options about the immediate correct action. One option must be correct, and the other two must be plausible but incorrect. Provide brief feedback for each option and a concise hint. ${studentFocus}`;
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

export const generateVideoLesson = async (disasterType: DisasterType, videoStyle: VideoStyle): Promise<Blob | null> => {
    const styleDescription = videoStyle === 'cartoon'
        ? "an engaging, clear, and friendly 2D animated cartoon style suitable for students. Simple characters, bright colors."
        : "a realistic, high-fidelity simulation. Cinematic and serious tone, but not overly graphic or scary.";

    const coreContent: Record<DisasterType, string> = {
        [DisasterType.Earthquake]: `A school classroom starts shaking. Students practice 'Drop, Cover, and Hold On' under their desks. Show an evacuation to an open assembly point. End with a title card: "Earthquake Safety: Drop, Cover, Hold On!"`,
        [DisasterType.Flood]: `Heavy rain causing water levels to rise around a school. Show students calmly evacuating to a higher floor. A visual of a car being swept away with a "Turn Around, Don't Drown" text overlay. End with a title card: "Flood Preparedness: Stay Safe, Stay Dry."`,
        [DisasterType.Fire]: `A smoke alarm blares in a school hallway. Students are shown crawling low under smoke. A teacher demonstrates the P.A.S.S. method with a fire extinguisher on a small, controlled fire. Evacuation to an outdoor assembly point. End with a title card: "Fire Emergency: Get Out, Stay Out!"`,
        [DisasterType.Cyclone]: `Strong winds and rain lashing against school windows. Show students sheltered in a strong interior room away from windows. A tree branch falls outside. Show a post-cyclone scene with downed power lines. End with a title card: "Cyclone Alert: Weather the Storm Safely."`,
    };

    const prompt = `Generate a short, approximately 30-second educational video about ${disasterType} safety in a school setting in India. The video should be in ${styleDescription}. The scene should show: ${coreContent[disasterType]}. The video should be silent.`;

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (response.ok) {
                const videoBlob = await response.blob();
                return videoBlob;
            } else {
                console.error("Failed to download video:", response.statusText);
                return null;
            }
        }
        return null;

    } catch (error) {
        console.error("Error generating video lesson:", error);
        return null;
    }
};

export const generateSafetyTips = async (context: string): Promise<string | null> => {
    let contextDescription: string;
    switch(context) {
        case 'home':
            contextDescription = "on the main home screen of the app. Give general preparedness tips.";
            break;
        case 'modules':
            contextDescription = "looking at the list of available disaster study modules. Give tips about the importance of learning.";
            break;
        case 'drills':
            contextDescription = "in the virtual drills lobby, preparing to start a simulation. Give tips about how to approach a drill.";
            break;
        case DisasterType.Earthquake:
        case DisasterType.Flood:
        case DisasterType.Fire:
        case DisasterType.Cyclone:
            contextDescription = `studying the '${context}' disaster module. Give specific tips for this disaster.`;
            break;
        default:
            contextDescription = "using the app. Give general safety tips.";
    }

    const prompt = `You are an AI Safety Advisor for the CrisisGuardian app. A user is currently ${contextDescription}. 
    Generate 3 to 5 concise, actionable safety tips for them. 
    The tips should be encouraging and easy to understand for a student audience in India. 
    Format each tip on a new line, starting with a relevant emoji. Do not use markdown like bullet points.
    Example:
    📚 Knowledge is power! Regularly review your study modules to keep safety info fresh in your mind.
    ✅ Check your family's emergency kit every six months to ensure supplies are not expired.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating safety tips:", error);
        return null;
    }
};