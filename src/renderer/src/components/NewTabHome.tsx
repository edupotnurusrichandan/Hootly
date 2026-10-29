import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { OwlMascot } from './OwlMascot';
import { playSoftHoot } from '../utils/audio';
import {
  Zap,
  Award,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Search,
  Moon,
  Shield,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Lightbulb,
  Plus,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateExamCountdown, calculateLevelAndRank } from '@shared/habitEngine';

interface NewTabHomeProps {
  onNavigate: (url: string) => void;
  onOpenSettings: () => void;
  onOpenTimer?: () => void;
}

const QUICK_LINKS = [
  { name: 'Google Scholar', url: 'https://scholar.google.com', desc: 'Research papers & citations', icon: GraduationCap },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', desc: 'Free encyclopedia', icon: BookOpen },
  { name: 'Khan Academy', url: 'https://www.khanacademy.org', desc: 'Interactive lessons & practice', icon: Award },
  { name: 'WolframAlpha', url: 'https://www.wolframalpha.com', desc: 'Computational intelligence', icon: Zap },
  { name: 'arXiv', url: 'https://arxiv.org', desc: 'Open-access scientific papers', icon: Search },
  { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', desc: 'Biomedical literature database', icon: BookOpen }
];

const OWL_STUDY_TIPS = [
  {
    title: 'Active Recall',
    tag: 'Cognitive Science',
    desc: 'Testing yourself on material produces 50% stronger memory retention than passively re-reading notes or highlighting text.'
  },
  {
    title: 'The Feynman Technique',
    tag: 'Understanding',
    desc: 'Try explaining a complex concept out loud in plain English as if teaching a 10-year-old. You will instantly spot your knowledge gaps.'
  },
  {
    title: 'Spaced Repetition',
    tag: 'Long-term Memory',
    desc: 'Reviewing key concepts at increasing intervals (Day 1, Day 3, Day 7, Day 14) flattens the Ebbinghaus forgetting curve.'
  },
  {
    title: 'Interleaving Topics',
    tag: 'Problem Solving',
    desc: 'Alternate between two different subjects or question types instead of block-cramming one topic. This sharpens your brain’s discrimination skills.'
  },
  {
    title: 'The 20-20-20 Rule',
    tag: 'Wellbeing',
    desc: 'Every 20 minutes of screen study, look at an object at least 20 feet away for 20 seconds to prevent digital eye strain and headaches.'
  }
];

export const NewTabHome: React.FC<NewTabHomeProps> = ({ onNavigate, onOpenSettings, onOpenTimer }) => {
  const { theme, settings, updateSettings } = useTheme();

  const [tipIndex, setTipIndex] = useState(0);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamTargetHours, setNewExamTargetHours] = useState(15);

  // Time of day greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const bedtimeHour = settings?.bedtimeHour ?? 22;
  const isSleepy = bedtimeHour < 5
    ? hour >= bedtimeHour && hour < 5
    : hour >= bedtimeHour || hour < 5;

  // Study stats from sessions
  const sessions = settings?.studySessions || [];
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Calculate today's study minutes
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMinutes = sessions
    .filter((s) => s.timestamp >= todayStart.getTime())
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const dailyGoal = settings?.dailyGoalMinutes ?? 60;
  const percentage = dailyGoal <= 0 ? 100 : Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));

  // Circular progress stroke math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // XP & Level calculations
  const totalXp = settings?.xp ?? 0;
  const streakDays = settings?.streakDays ?? 0;
  const restTokens = settings?.restTokens ?? 0;
  const levelInfo = calculateLevelAndRank(totalXp, theme.ranks);
  const currentRank = levelInfo.rankName;

  // Smart goal suggestion based on past 7 days average
  const past7DaysMinutes = sessions
    .filter((s) => s.timestamp >= now - 7 * oneDayMs)
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const averageDailyMinutes = Math.round(past7DaysMinutes / 7);
  const suggestedGoal = Math.max(30, Math.round((averageDailyMinutes * 1.15) / 5) * 5);

  // Handle claiming quest XP
  const handleClaimQuest = (questId: string, reward: number) => {
    const updatedQuests = (settings?.quests || []).map((q) =>
      q.id === questId ? { ...q, claimed: true } : q
    );
    updateSettings({
      quests: updatedQuests,
      xp: totalXp + reward
    });
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    if (settings?.soundEffectsEnabled) {
      playSoftHoot();
    }
  };

  // Handle adding new exam countdown
  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle || !newExamDate) return;

    const newExam = {
      id: `exam-${Date.now()}`,
      title: newExamTitle,
      subject: newExamSubject || 'General',
      examDate: newExamDate,
      targetHours: Number(newExamTargetHours) || 15,
      completedHours: 0
    };

    updateSettings({
      exams: [...(settings?.exams || []), newExam]
    });

    setNewExamTitle('');
    setNewExamSubject('');
    setNewExamDate('');
    setIsAddingExam(false);
  };

  // Generate 12-week heatmap data grid
  const renderHeatmap = () => {
    const weeks = 12;
    const daysInGrid = weeks * 7;
    const gridDays = [];

    for (let i = daysInGrid - 1; i >= 0; i--) {
      const dayDate = new Date();
      dayDate.setHours(0, 0, 0, 0);
      dayDate.setDate(dayDate.getDate() - i);
      const startOfDay = new Date(dayDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dayDate);
      endOfDay.setHours(23, 59, 59, 999);

      const dayMinutes = sessions
        .filter((s) => s.timestamp >= startOfDay.getTime() && s.timestamp <= endOfDay.getTime())
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      gridDays.push({
        date: `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`,
        minutes: dayMinutes
      });
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${weeks}, 1fr)`,
          gridTemplateRows: 'repeat(7, 1fr)',
          gridAutoFlow: 'column',
          gap: '3px',
          width: '100%',
          maxWidth: '380px'
        }}
      >
        {gridDays.map((d, i) => {
          let bg = 'var(--bg)';
          if (d.minutes > 0 && d.minutes < 30) bg = 'rgba(99, 102, 241, 0.3)';
          else if (d.minutes >= 30 && d.minutes < 60) bg = 'rgba(99, 102, 241, 0.6)';
          else if (d.minutes >= 60) bg = 'var(--accent)';

          return (
            <div
              key={i}
              title={`${d.date}: ${d.minutes}m studied`}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                backgroundColor: bg,
                border: '1px solid var(--border)'
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        flex: 1,
        height: 'calc(100vh - var(--topbar-height))',
        overflowY: 'auto',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        padding: '32px 24px 60px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div style={{ width: '100%', maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
        {/* Header & Themed Greeting */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--accent)',
              marginBottom: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span>{theme.name} Theme</span>
            <span>•</span>
            <span>{timeGreeting}</span>
          </div>

          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.6px',
              marginBottom: '8px',
              background: `linear-gradient(135deg, var(--text), var(--accent))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {theme.greeting}
          </h1>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Your calm companion for academic focus, healthy study habits, and deep work momentum.
          </p>
        </div>

        {/* Night Mode / Sleepy Barnaby Wind-Down Banner */}
        {isSleepy && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid #6366f1',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.15)'
            }}
          >
            <OwlMascot size={48} isSleepy={true} streakDays={streakDays} level={levelInfo.level} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <Moon size={14} style={{ color: '#818cf8' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                  Hootly is winding down for the night
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    color: '#818cf8',
                    fontWeight: 600,
                    backgroundColor: 'rgba(99,102,241,0.15)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  Past {bedtimeHour}:00 Bedtime
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                Sleep helps consolidate today’s learnings into long-term memory. Consider wrapping up and getting a restful night! 🌙
              </p>
            </div>
          </div>
        )}

        {/* Habit Engine Cards (Goal Ring, Streak, XP) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr',
            gap: '16px'
          }}
        >
          {/* Daily Goal Ring Card */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '18px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px'
            }}
          >
            {/* SVG Progress Ring */}
            <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--grad-from)" />
                    <stop offset="100%" stopColor="var(--grad-to)" />
                  </linearGradient>
                </defs>
                <circle cx="80" cy="80" r={radius} fill="transparent" stroke="var(--bg)" strokeWidth="12" />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="url(#ringGrad)"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                  {percentage}%
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Complete
                </span>
              </div>
            </div>

            {/* Goal Text Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Today's Focus
              </span>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
                {todayMinutes} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>/ {dailyGoal} min</span>
              </div>
              <button
                onClick={onOpenTimer}
                style={{
                  fontSize: '11px',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  padding: 0,
                  marginTop: '2px'
                }}
              >
                <span>Start Session</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Streak Flame Card with Perched Owl */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Study Streak
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#f97316', margin: '2px 0' }}>
                {streakDays} Days
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981' }}>
                <Shield size={12} />
                <span>{restTokens} Rest Tokens</span>
              </div>
              <button
                onClick={() => playSoftHoot()}
                style={{
                  fontSize: '10px',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  marginTop: '4px',
                  display: 'inline-block',
                  background: 'transparent',
                  padding: 0
                }}
              >
                Click Hootly to hoot ♫
              </button>
            </div>

            <OwlMascot
              size={64}
              streakDays={streakDays}
              level={levelInfo.level}
              isSleepy={isSleepy}
              onClick={() => playSoftHoot()}
            />
          </div>

          {/* XP & Rank Card */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Level {levelInfo.level} Progression
              </span>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)'
                }}
              >
                <Award size={15} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                {currentRank}
              </div>

              {/* XP Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg)',
                  overflow: 'hidden',
                  marginBottom: '6px'
                }}
              >
                <div
                  style={{
                    width: `${levelInfo.progressPercent}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, var(--grad-from), var(--grad-to))`,
                    borderRadius: 'var(--radius-full)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>{totalXp} XP total</span>
                <span>{levelInfo.nextLevelXP - levelInfo.currentLevelXP} XP to next level</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Study Heatmap & Smart Goal on Left | Quests on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '16px' }}>
          {/* Left: Study Heatmap & Smart Goal Suggestion */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                  Study Heatmap (Last 12 Weeks)
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {past7DaysMinutes}m this week
              </span>
            </div>

            {/* Calendar grid */}
            {renderHeatmap()}

            {/* Smart Goal Suggestion Banner */}
            <div
              style={{
                backgroundColor: 'var(--bg)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                  Smart Goal Recommendation
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Based on your {averageDailyMinutes}m daily average, aim for {suggestedGoal}m next week!
                </div>
              </div>
              {dailyGoal !== suggestedGoal && (
                <button
                  onClick={() => updateSettings({ dailyGoalMinutes: suggestedGoal })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  Set {suggestedGoal}m
                </button>
              )}
            </div>
          </div>

          {/* Right: Quests & Habit Challenges */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: '#eab308' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                  Scholar Quests & Bonus XP
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Resets Weekly
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(settings?.quests || []).map((q) => (
                <div
                  key={q.id}
                  style={{
                    backgroundColor: 'var(--bg)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                        {q.title}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#eab308',
                          fontWeight: 700,
                          backgroundColor: 'rgba(234, 179, 8, 0.12)',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)'
                        }}
                      >
                        +{q.xpReward} XP
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {q.description} ({q.currentProgress}/{q.targetProgress})
                    </div>
                  </div>

                  {q.completed ? (
                    q.claimed ? (
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimQuest(q.id, q.xpReward)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                      >
                        Claim!
                      </button>
                    )
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>In progress</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Exam Countdowns on Left | Rotating Study Tips on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '16px' }}>
          {/* Exam Countdowns Card */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                  Exam Countdowns & Target Pace
                </span>
              </div>
              <button
                onClick={() => setIsAddingExam(!isAddingExam)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  background: 'transparent',
                  padding: 0
                }}
              >
                <Plus size={14} />
                <span>{isAddingExam ? 'Cancel' : 'Add Exam'}</span>
              </button>
            </div>

            {/* Inline Add Exam Form */}
            {isAddingExam && (
              <form
                onSubmit={handleAddExam}
                style={{
                  backgroundColor: 'var(--bg)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <input
                  type="text"
                  placeholder="Exam Title (e.g. History Final)"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '12px'
                  }}
                  required
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="date"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: '12px'
                    }}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Prep Hours"
                    value={newExamTargetHours}
                    onChange={(e) => setNewExamTargetHours(Number(e.target.value))}
                    style={{
                      width: '100px',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: '12px'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  Save Exam
                </button>
              </form>
            )}

            {/* Exam list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(settings?.exams || []).map((exam) => {
                const targetPace = calculateExamCountdown(exam.examDate, new Date(), exam.targetHours, exam.completedHours);
                return (
                  <div
                    key={exam.id}
                    style={{
                      backgroundColor: 'var(--bg)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                        {exam.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {targetPace.daysRemaining} days left • Pace: <strong style={{ color: 'var(--accent)' }}>{targetPace.suggestedDailyMinutes}m / day</strong>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: targetPace.daysRemaining <= 7 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: targetPace.daysRemaining <= 7 ? '#ef4444' : 'var(--accent)',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {targetPace.daysRemaining}d left
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rotating Science-Backed Study Tips Card */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lightbulb size={16} style={{ color: '#eab308' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                    Hootly’s Study Technique
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    backgroundColor: 'var(--bg)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {OWL_STUDY_TIPS[tipIndex].tag}
                </span>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px 0' }}>
                {OWL_STUDY_TIPS[tipIndex].title}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {OWL_STUDY_TIPS[tipIndex].desc}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button
                onClick={() => setTipIndex((prev) => (prev + 1) % OWL_STUDY_TIPS.length)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border)'
                }}
              >
                <span>Next Technique 💡</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Academic & Study Essentials
            </h3>
            <button
              onClick={onOpenSettings}
              style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, background: 'transparent' }}
            >
              Change Theme
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}
          >
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <div
                  key={link.name}
                  onClick={() => onNavigate(link.url)}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={17} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {link.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {link.desc}
                    </div>
                  </div>

                  <ExternalLink size={13} style={{ color: 'var(--text-muted)', opacity: 0.7 }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
