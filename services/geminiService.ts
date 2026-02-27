import { DisasterType, DrillStep, DrillMode, VideoStyle } from '../types';

interface PreviousStepContext {
  scenario: string;
  question: string;
  userAnswer: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  };
  stepsSurvived?: number;
}

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
};

export const generateDrillScenario = async (
  disasterType: DisasterType,
  region: string,
  mode: DrillMode,
  previousStepContext?: PreviousStepContext,
  signal?: AbortSignal
): Promise<DrillStep | null> => {
  try {
    return await apiFetch<DrillStep>('/ai/drill-scenario', {
      method: 'POST',
      signal,
      body: JSON.stringify({ disasterType, region, mode, previousStepContext }),
    });
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError')) {
      console.error('Error generating drill scenario:', error);
    }
    return null;
  }
};

export const generateVideoLesson = async (
  disasterType: DisasterType,
  videoStyle: VideoStyle
): Promise<Blob | null> => {
  try {
    const response = await fetch('/api/ai/video-lesson', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ disasterType, videoStyle }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error generating video lesson:', error);
    return null;
  }
};

export const generateSafetyTips = async (context: string): Promise<string | null> => {
  try {
    const payload = await apiFetch<{ tips: string }>('/ai/safety-tips', {
      method: 'POST',
      body: JSON.stringify({ context }),
    });
    return payload.tips;
  } catch (error) {
    console.error('Error generating safety tips:', error);
    return null;
  }
};
