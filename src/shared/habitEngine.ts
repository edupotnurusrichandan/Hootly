/**
 * Pure habit engine calculations (Streaks, XP, Levels, Goals, Rest Tokens, and Exam Countdowns)
 * Used across the StudyBrowser client and tests.
 */

export interface LevelInfo {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  rankName: string;
}

/**
 * Calculates XP earned from a study session.
 * Rule: 1 XP per focused minute, +25 bonus XP for hitting daily goal, +50 bonus XP for 5+ day streak.
 */
export function calculateSessionXP(
  focusedMinutes: number,
  hitDailyGoal: boolean = false,
  streakDays: number = 0
): number {
  if (!Number.isFinite(focusedMinutes) || focusedMinutes <= 0) return 0;

  let xp = Math.round(focusedMinutes);

  if (hitDailyGoal) {
    xp += 25; // Goal completion bonus
  }

  if (streakDays >= 5) {
    xp += 50; // Consistency streak bonus
  }

  return xp;
}

/**
 * Calculates student level and active rank from total accumulated XP.
 * Each level requires 200 * level XP.
 */
export function calculateLevelAndRank(
  totalXP: number,
  ranks: string[] = ['Novice Scholar', 'Focused Apprentice', 'Dedicated Learner', 'Master Student', 'Grand Scholar']
): LevelInfo {
  const safeXP = Number.isFinite(totalXP) ? Math.max(0, totalXP) : 0;
  const safeRanks = ranks.length > 0 ? ranks : ['Scholar'];
  let level = Math.floor((Math.sqrt(1 + safeXP / 25) - 1) / 2) + 1;
  let accumulatedRequirement = 100 * (level - 1) * level;
  // Correct floating point boundary rounding without iterating through every level.
  if (safeXP < accumulatedRequirement && level > 1) {
    level -= 1;
    accumulatedRequirement = 100 * (level - 1) * level;
  } else if (safeXP >= accumulatedRequirement + 200 * level) {
    level += 1;
    accumulatedRequirement = 100 * (level - 1) * level;
  }
  const xpNeededForThisLevel = level * 200;
  const currentLevelXP = safeXP - accumulatedRequirement;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / xpNeededForThisLevel) * 100));
  const rankIndex = Math.min(level - 1, safeRanks.length - 1);
  return {
    level,
    currentLevelXP,
    nextLevelXP: xpNeededForThisLevel,
    progressPercent,
    rankName: safeRanks[rankIndex] || safeRanks[0]
  };
}

/**
 * Calculates daily goal progress percentage and remaining minutes.
 */
export function calculateGoalProgress(
  focusedMinutes: number,
  dailyGoalMinutes: number
): { percentage: number; remainingMinutes: number; isCompleted: boolean } {
  if (!Number.isFinite(dailyGoalMinutes) || dailyGoalMinutes <= 0) {
    return { percentage: 100, remainingMinutes: 0, isCompleted: true };
  }

  const safeMinutes = Number.isFinite(focusedMinutes) ? Math.max(0, focusedMinutes) : 0;
  const percentage = Math.min(100, Math.round((safeMinutes / dailyGoalMinutes) * 100));
  const remainingMinutes = Math.max(0, dailyGoalMinutes - safeMinutes);
  const isCompleted = safeMinutes >= dailyGoalMinutes;

  return { percentage, remainingMinutes, isCompleted };
}

/**
 * Calculates streak updates with Rest-Day Token support.
 * If 1 day was missed and the student has rest tokens, a token is consumed to protect the streak!
 */
export function updateStreakWithRestTokens(
  lastStudyDateStr: string | null,
  currentDate: Date,
  currentStreak: number,
  availableTokens: number = 0
): {
  newStreak: number;
  streakMaintained: boolean;
  tokenUsed: boolean;
  tokensRemaining: number;
} {
  if (!lastStudyDateStr) {
    return {
      newStreak: 1,
      streakMaintained: true,
      tokenUsed: false,
      tokensRemaining: availableTokens
    };
  }

  const lastDate = parseCalendarDate(lastStudyDateStr);
  if (!lastDate || !Number.isFinite(currentStreak) || !Number.isFinite(availableTokens)) {
    return { newStreak: 1, streakMaintained: false, tokenUsed: false, tokensRemaining: Math.max(0, availableTokens || 0) };
  }
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const studyDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

  const diffTime = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(studyDay.getFullYear(), studyDay.getMonth(), studyDay.getDate());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already studied today
    return {
      newStreak: currentStreak,
      streakMaintained: true,
      tokenUsed: false,
      tokensRemaining: availableTokens
    };
  } else if (diffDays === 1) {
    // Studied yesterday, normal streak increase
    return {
      newStreak: currentStreak + 1,
      streakMaintained: true,
      tokenUsed: false,
      tokensRemaining: availableTokens
    };
  } else if (diffDays === 2 && availableTokens > 0) {
    // Missed exactly 1 day, but saved by a Rest Token!
    return {
      newStreak: currentStreak + 1,
      streakMaintained: true,
      tokenUsed: true,
      tokensRemaining: availableTokens - 1
    };
  } else {
    // Missed more days or no tokens left, resets to 1
    return {
      newStreak: 1,
      streakMaintained: false,
      tokenUsed: false,
      tokensRemaining: availableTokens
    };
  }
}

/**
 * Exam countdown and daily minutes suggestion calculator.
 */
export function calculateExamCountdown(
  examDateStr: string,
  currentDate: Date,
  targetTotalHours: number = 20,
  completedHours: number = 0
): {
  daysRemaining: number;
  remainingHours: number;
  suggestedDailyMinutes: number;
  isUrgent: boolean;
  isPast: boolean;
} {
  const examDate = parseCalendarDate(examDateStr);
  if (!examDate || !Number.isFinite(targetTotalHours) || !Number.isFinite(completedHours)) {
    return { daysRemaining: 0, remainingHours: 0, suggestedDailyMinutes: 0, isUrgent: false, isPast: true };
  }
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const targetDay = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());

  const diffTime = Date.UTC(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      daysRemaining: 0,
      remainingHours: 0,
      suggestedDailyMinutes: 0,
      isUrgent: false,
      isPast: true
    };
  }

  const remainingHours = Math.max(0, targetTotalHours - completedHours);
  const activeDays = Math.max(1, daysRemaining);
  const suggestedDailyMinutes = Math.min(360, Math.ceil((remainingHours * 60) / activeDays));

  return {
    daysRemaining,
    remainingHours,
    suggestedDailyMinutes,
    isUrgent: daysRemaining <= 3,
    isPast: false
  };
}

function parseCalendarDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
