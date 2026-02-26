import { AnalyticsData, DrillResult } from '../types';

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
  await apiFetch<{ ok: boolean }>('/analytics/drill-complete', {
    method: 'POST',
    body: JSON.stringify(result),
  });
};
