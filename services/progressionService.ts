import { User, DrillResult, ProgressionSummary, Achievement, AchievementId, DisasterType, Difficulty, DrillMode } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';

// --- XP & Level Calculation ---
const XP_BASE_DRILL = 100;
const XP_PER_CORRECT_ANSWER = 25;
const XP_PERFECT_SCORE_BONUS = 50;
const XP_DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
    [Difficulty.Easy]: 1,
    [Difficulty.Medium]: 1.5,
    [Difficulty.Hard]: 2.0,
};
const XP_PER_SURVIVAL_STEP = 50;
const XP_SURVIVAL_MILESTONE_BONUS = 100; // Bonus every 5 steps

// Exponential scaling for levels: level = sqrt(xp / 100) + 1
// Reverse formula: xp = 100 * (level - 1)^2
export const getXpForLevel = (level: number): number => {
    if (level <= 1) return 0;
    return 100 * Math.pow(level - 1, 2);
};

export const calculateLevel = (xp: number): { level: number, xpForNextLevel: number } => {
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const xpForNextLevel = getXpForLevel(level + 1);
    return { level, xpForNextLevel };
};

// --- Main Progression Logic ---

export const processActivityCompletion = (
    user: User, 
    activity: { type: 'drill', details: DrillResult }
): { updatedUser: User, summary: ProgressionSummary } => {

    const oldUser = { ...user };
    let xpGained = 0;
    let trophiesGained = 0;
    const { details: drillDetails } = activity;

    // 1. Calculate XP and Trophies from the activity
    if (drillDetails.mode === 'Survival') {
        const steps = drillDetails.stepsSurvived || 0;
        xpGained += steps * XP_PER_SURVIVAL_STEP;
        // Add milestone bonuses
        const milestonesReached = Math.floor(steps / 5);
        xpGained += milestonesReached * XP_SURVIVAL_MILESTONE_BONUS;

    } else { // Standard drill
        const { score, totalQuestions, difficulty } = drillDetails;
        if (score !== undefined && totalQuestions !== undefined) {
            xpGained += XP_BASE_DRILL;
            xpGained += score * XP_PER_CORRECT_ANSWER;
            if (score === totalQuestions) {
                xpGained += XP_PERFECT_SCORE_BONUS;
            }
            xpGained *= XP_DIFFICULTY_MULTIPLIER[difficulty];
        }
        
        switch (difficulty) {
            case Difficulty.Easy: trophiesGained = 2; break;
            case Difficulty.Medium: trophiesGained = 5; break;
            case Difficulty.Hard: trophiesGained = 10; break;
        }
    }
    
    xpGained = Math.round(xpGained);
    const newXp = user.xp + xpGained;

    // 2. Update user history and stats
    user.drillHistory.push(drillDetails);
    user.trophies = (user.trophies || 0) + trophiesGained;

    // Recalculate average score *only based on standard drills*
    const standardDrills = user.drillHistory.filter(d => d.mode === 'Standard' && d.score !== undefined && d.totalQuestions !== undefined && d.totalQuestions > 0);
    const totalScorePercentage = standardDrills.reduce(
      (sum, drill) => sum + (drill.score! / drill.totalQuestions!) * 100,
      0
    );
    user.score = standardDrills.length > 0 ? Math.round(totalScorePercentage / standardDrills.length) : 0;


    // 3. Check for Streak Update
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivityDate = user.streak.lastActivityDate ? new Date(user.streak.lastActivityDate) : null;
    if (lastActivityDate) {
        lastActivityDate.setHours(0, 0, 0, 0);
    }
    
    let streakUpdated = false;
    if (!lastActivityDate || today.getTime() > lastActivityDate.getTime()) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (lastActivityDate && lastActivityDate.getTime() === yesterday.getTime()) {
            user.streak.count += 1; // Continue streak
        } else {
            user.streak.count = 1; // Start new streak
        }
        user.streak.lastActivityDate = today.toISOString();
        streakUpdated = true;
    }

    // 4. Update XP and Level
    user.xp = newXp;
    const oldLevelInfo = calculateLevel(oldUser.xp);
    const newLevelInfo = calculateLevel(user.xp);
    user.level = newLevelInfo.level;
    const leveledUp = newLevelInfo.level > oldLevelInfo.level;
    
    // 5. Check for new achievements
    const newlyUnlocked: Achievement[] = [];
    const existingAchievements = new Set(user.unlockedAchievements.map(ach => ach.achievementId));

    ACHIEVEMENTS_LIST.forEach(achievement => {
        if (!existingAchievements.has(achievement.id)) {
            let unlocked = false;
            switch (achievement.id) {
                // Drill count
                case AchievementId.FirstDrill: unlocked = user.drillHistory.length >= 1; break;
                case AchievementId.FiveDrills: unlocked = user.drillHistory.length >= 5; break;
                case AchievementId.TenDrills: unlocked = user.drillHistory.length >= 10; break;
                case AchievementId.TwentyFiveDrills: unlocked = user.drillHistory.length >= 25; break;
                case AchievementId.FiftyDrills: unlocked = user.drillHistory.length >= 50; break;
                // Score based
                case AchievementId.PerfectScore: unlocked = drillDetails.mode === 'Standard' && drillDetails.score === drillDetails.totalQuestions; break;
                case AchievementId.HighAchiever: unlocked = user.score > 90; break;
                // Disaster master
                case AchievementId.EarthquakeMaster: unlocked = isDisasterMaster(user, DisasterType.Earthquake); break;
                case AchievementId.FloodMaster: unlocked = isDisasterMaster(user, DisasterType.Flood); break;
                case AchievementId.FireMaster: unlocked = isDisasterMaster(user, DisasterType.Fire); break;
                case AchievementId.CycloneMaster: unlocked = isDisasterMaster(user, DisasterType.Cyclone); break;
                case AchievementId.AllRounder: unlocked = isAllRounder(user); break;
                // Streaks
                case AchievementId.ThreeDayStreak: unlocked = user.streak.count >= 3; break;
                case AchievementId.SevenDayStreak: unlocked = user.streak.count >= 7; break;
                case AchievementId.FourteenDayStreak: unlocked = user.streak.count >= 14; break;
                case AchievementId.ThirtyDayStreak: unlocked = user.streak.count >= 30; break;
                // Survival Mode
                case AchievementId.SurvivalFive: unlocked = drillDetails.mode === 'Survival' && (drillDetails.stepsSurvived || 0) >= 5; break;
                case AchievementId.SurvivalTen: unlocked = drillDetails.mode === 'Survival' && (drillDetails.stepsSurvived || 0) >= 10; break;
                case AchievementId.SurvivalTwenty: unlocked = drillDetails.mode === 'Survival' && (drillDetails.stepsSurvived || 0) >= 20; break;
            }

            if (unlocked) {
                user.unlockedAchievements.push({
                    achievementId: achievement.id,
                    dateUnlocked: new Date().toISOString()
                });
                newlyUnlocked.push(achievement);
            }
        }
    });

    const summary: ProgressionSummary = {
        xpGained,
        leveledUp,
        oldLevel: oldLevelInfo.level,
        newLevel: newLevelInfo.level,
        oldXp: oldUser.xp,
        newXp: user.xp,
        trophiesGained,
        newlyUnlocked,
        streakUpdated,
        newStreak: user.streak.count,
        mode: drillDetails.mode,
        score: drillDetails.score,
        totalQuestions: drillDetails.totalQuestions,
        stepsSurvived: drillDetails.stepsSurvived,
    };

    return { updatedUser: user, summary };
};

// Helper function to check for disaster mastery
const isDisasterMaster = (user: User, disasterType: DisasterType): boolean => {
    return user.drillHistory.some(drill => 
        drill.mode === 'Standard' &&
        drill.disasterType === disasterType &&
        drill.difficulty === Difficulty.Hard &&
        drill.score === drill.totalQuestions
    );
};

// Helper function to check for All-Rounder mastery
const isAllRounder = (user: User): boolean => {
    const disasterTypes: DisasterType[] = [
        DisasterType.Earthquake,
        DisasterType.Flood,
        DisasterType.Fire,
        DisasterType.Cyclone,
    ];

    return disasterTypes.every(type =>
        isDisasterMaster(user, type)
    );
};