import { AnalyticsData, DrillResult } from '../types';

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api${path}`, {
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

const getDefaultAnalytics = (): AnalyticsData => ({
  totalDrillsCompleted: 0,
  overallScoreSum: 0,
  overallQuestionSum: 0,
  drillsByType: {},
  scoresByType: {},
});

export const getAnalytics = async (): Promise<AnalyticsData> => {
  try {
    return await apiFetch<AnalyticsData>('/analytics');
  } catch {
    return getDefaultAnalytics();
  }
};

const saveAnalytics = async (data: AnalyticsData): Promise<void> => {
  await apiFetch<{ ok: boolean }>('/analytics', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const updateAnalyticsOnDrillComplete = async (result: DrillResult): Promise<void> => {
  const data = await getAnalytics();

  data.totalDrillsCompleted += 1;
  data.drillsByType[result.disasterType] = (data.drillsByType[result.disasterType] || 0) + 1;

  if (result.mode === 'Standard' && result.score !== undefined && result.totalQuestions !== undefined) {
    const { disasterType, score, totalQuestions } = result;

    data.overallScoreSum += score;
    data.overallQuestionSum += totalQuestions;

    const typeScores = data.scoresByType[disasterType] || { scoreSum: 0, questionSum: 0, count: 0 };
    typeScores.scoreSum += score;
    typeScores.questionSum += totalQuestions;
    typeScores.count += 1;
    data.scoresByType[disasterType] = typeScores;
  }

  await saveAnalytics(data);
};
