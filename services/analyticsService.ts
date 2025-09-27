import { AnalyticsData, DrillResult } from '../types';

const ANALYTICS_DB_KEY = 'crisis_guardian_analytics';

const getDefaultAnalytics = (): AnalyticsData => ({
  totalDrillsCompleted: 0,
  overallScoreSum: 0,
  overallQuestionSum: 0,
  drillsByType: {},
  scoresByType: {},
});

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const data = localStorage.getItem(ANALYTICS_DB_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return getDefaultAnalytics();
};

const saveAnalytics = async (data: AnalyticsData): Promise<void> => {
  localStorage.setItem(ANALYTICS_DB_KEY, JSON.stringify(data));
};

export const updateAnalyticsOnDrillComplete = async (result: DrillResult): Promise<void> => {
  const data = await getAnalytics();
  
  // Update stats that apply to all modes
  data.totalDrillsCompleted += 1;
  data.drillsByType[result.disasterType] = (data.drillsByType[result.disasterType] || 0) + 1;

  // Only update score-based analytics for Standard drills
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