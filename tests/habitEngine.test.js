const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadTypeScript } = require('./loadTypeScript');

const engine = loadTypeScript(path.join(__dirname, '..', 'src', 'shared', 'habitEngine.ts'));
const reminders = loadTypeScript(path.join(__dirname, '..', 'src', 'shared', 'reminders.ts'));

describe('Hootly habit engine (production source)', () => {
  test('validates and awards session XP and bonuses', () => {
    assert.equal(engine.calculateSessionXP(30), 30);
    assert.equal(engine.calculateSessionXP(45, true), 70);
    assert.equal(engine.calculateSessionXP(60, true, 5), 135);
    assert.equal(engine.calculateSessionXP(-1), 0);
    assert.equal(engine.calculateSessionXP(Infinity), 0);
  });

  test('calculates level boundaries without rank or progress overflow', () => {
    assert.deepEqual(engine.calculateLevelAndRank(0), {
      level: 1, currentLevelXP: 0, nextLevelXP: 200, progressPercent: 0, rankName: 'Novice Scholar'
    });
    assert.equal(engine.calculateLevelAndRank(200).level, 2);
    assert.equal(engine.calculateLevelAndRank(600).level, 3);
    assert.equal(engine.calculateLevelAndRank(-100).currentLevelXP, 0);
    assert.equal(engine.calculateLevelAndRank(Number.MAX_SAFE_INTEGER).progressPercent <= 100, true);
  });

  test('calculates bounded daily goal progress for invalid and over-goal values', () => {
    assert.deepEqual(engine.calculateGoalProgress(45, 60), { percentage: 75, remainingMinutes: 15, isCompleted: false });
    assert.deepEqual(engine.calculateGoalProgress(90, 60), { percentage: 100, remainingMinutes: 0, isCompleted: true });
    assert.deepEqual(engine.calculateGoalProgress(20, 0), { percentage: 100, remainingMinutes: 0, isCompleted: true });
    assert.equal(engine.calculateGoalProgress(NaN, 60).percentage, 0);
  });

  test('preserves streaks across exactly one missed day when a rest token exists', () => {
    const result = engine.updateStreakWithRestTokens('2026-10-24', new Date(2026, 9, 26), 10, 1);
    assert.deepEqual(result, { newStreak: 11, streakMaintained: true, tokenUsed: true, tokensRemaining: 0 });
    assert.equal(engine.updateStreakWithRestTokens('2026-10-24', new Date(2026, 9, 26), 10, 0).newStreak, 1);
  });

  test('handles calendar boundaries and rejects malformed dates', () => {
    assert.equal(engine.updateStreakWithRestTokens('2026-02-28', new Date(2026, 2, 1), 4).newStreak, 5);
    assert.equal(engine.updateStreakWithRestTokens('not-a-date', new Date(2026, 2, 1), 4).streakMaintained, false);
    assert.equal(engine.calculateExamCountdown('2026-02-30', new Date(2026, 1, 1)).isPast, true);
  });

  test('calculates exam countdowns and study pace from real implementation', () => {
    const result = engine.calculateExamCountdown('2026-11-05', new Date(2026, 9, 26), 20, 0);
    assert.equal(result.daysRemaining, 10);
    assert.equal(result.suggestedDailyMinutes, 120);
    assert.equal(engine.calculateExamCountdown('2026-10-25', new Date(2026, 9, 26)).isPast, true);
    assert.equal(engine.calculateExamCountdown('2026-10-29', new Date(2026, 9, 26), 500, 0).suggestedDailyMinutes, 360);
  });
});

describe('Bedtime reminders (production source)', () => {
  test('honors selected bedtime and overnight quiet hours', () => {
    assert.equal(reminders.isBedtimeReminderDue(new Date(2026, 9, 29, 21, 59), 22), false);
    assert.equal(reminders.isBedtimeReminderDue(new Date(2026, 9, 29, 22, 0), 22), true);
    assert.equal(reminders.isBedtimeReminderDue(new Date(2026, 9, 30, 2, 0), 22), true);
    assert.equal(reminders.isBedtimeReminderDue(new Date(2026, 9, 29, 12, 0), 24), false);
    assert.equal(reminders.isBedtimeReminderDue(new Date(2026, 9, 30, 2, 0), 24), true);
    assert.equal(reminders.isBedtimeReminderDue(new Date(), 25), false);
  });

  test('uses one reminder date key across midnight', () => {
    assert.equal(reminders.bedtimeReminderKey(new Date(2026, 9, 30, 2, 0)), '2026-10-29');
    assert.equal(reminders.bedtimeReminderKey(new Date(2026, 9, 30, 22, 0)), '2026-10-30');
  });
});
