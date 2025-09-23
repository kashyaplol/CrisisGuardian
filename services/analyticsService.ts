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
  const { disasterType, score, totalQuestions } = result;

  // Update overall stats
  data.totalDrillsCompleted += 1;
  data.overallScoreSum += score;
  data.overallQuestionSum += totalQuestions;

  // Update drills by type
  data.drillsByType[disasterType] = (data.drillsByType[disasterType] || 0) + 1;

  // Update scores by type
  const typeScores = data.scoresByType[disasterType] || { scoreSum: 0, questionSum: 0, count: 0 };
  typeScores.scoreSum += score;
  typeScores.questionSum += totalQuestions;
  typeScores.count += 1;
  data.scoresByType[disasterType] = typeScores;

  await saveAnalytics(data);
};