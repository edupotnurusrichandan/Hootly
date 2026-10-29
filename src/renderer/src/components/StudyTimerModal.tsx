import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { StudySession } from '@shared/types';
import { calculateSessionXP } from '@shared/habitEngine';
import { OwlMascot } from './OwlMascot';
import { playSoftHoot } from '../utils/audio';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Clock,
  Heart,
  Eye,
  Droplets,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete?: (session: StudySession) => void;
}

type TimerPhase = 'idle' | 'focus' | 'break' | 'reflection';

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  onSessionComplete
}) => {
  const { settings, updateSettings } = useTheme();

  // Timer Configuration
  const [focusDurationMinutes, setFocusDurationMinutes] = useState(25);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(5);
  const [subject, setSubject] = useState(settings?.spaces?.[0]?.name || 'General Study');
  const [intention, setIntention] = useState('');

  // Live Timer State
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [snoozeUsed, setSnoozeUsed] = useState(false);

  // Reflection State
  const [reflectionRating, setReflectionRating] = useState<number>(5);
  const [reflectionNotes, setReflectionNotes] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync spaces if updated
  useEffect(() => {
    if (settings?.spaces && settings.spaces.length > 0) {
      const activeSpace = settings.spaces.find((s) => s.id === settings.activeSpaceId);
      if (activeSpace) {
        setSubject(activeSpace.name);
      }
    }
  }, [settings?.activeSpaceId, settings?.spaces]);

  // Main tick engine
  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setSecondsRemaining((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || secondsRemaining > 0) return;
    setIsRunning(false);
    if (settings?.soundEffectsEnabled) playSoftHoot();

    if (phase === 'focus') {
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } catch {
        // Ignore unavailable animation support.
      }
      setPhase('reflection');
    } else if (phase === 'break') {
      setPhase('idle');
      setSecondsRemaining(focusDurationMinutes * 60);
      setTotalSeconds(focusDurationMinutes * 60);
    }
  }, [isRunning, secondsRemaining, phase, settings?.soundEffectsEnabled, focusDurationMinutes]);

  const handleStartFocus = () => {
    setSnoozeUsed(false);
    setPhase('focus');
    const secs = focusDurationMinutes * 60;
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    setIsRunning(true);
  };

  const handleStartBreak = () => {
    setPhase('break');
    const secs = breakDurationMinutes * 60;
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    setIsRunning(true);
  };

  const handleSnoozeFiveMinutes = () => {
    if (snoozeUsed || phase !== 'focus') return;
    setSnoozeUsed(true);
    setSecondsRemaining((prev) => prev + 5 * 60);
    setTotalSeconds((prev) => prev + 5 * 60);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('idle');
    setSecondsRemaining(focusDurationMinutes * 60);
    setTotalSeconds(focusDurationMinutes * 60);
  };

  const handleCompleteReflection = () => {
    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      subject,
      durationMinutes: Math.max(1, Math.round(totalSeconds / 60)),
      intention: intention || 'Focused study block',
      reflectionRating,
      reflectionNotes,
      timestamp: Date.now()
    };
    const currentSessions = settings?.studySessions || [];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const minutesBeforeSession = currentSessions
      .filter((session) => session.timestamp >= todayStart.getTime())
      .reduce((total, session) => total + session.durationMinutes, 0);
    const goal = settings?.dailyGoalMinutes ?? 60;
    const fallbackXp = calculateSessionXP(
      newSession.durationMinutes,
      goal > 0 && minutesBeforeSession < goal && minutesBeforeSession + newSession.durationMinutes >= goal,
      settings?.streakDays ?? 0
    );
    const fallbackSettings = {
      studySessions: [newSession, ...currentSessions].slice(0, 365),
      xp: (settings?.xp || 0) + fallbackXp
    };

    // Record session via IPC — handles streak/XP logic on the main process
    if (window.studyBrowser?.recordStudySession) {
      window.studyBrowser.recordStudySession(newSession).catch(() => {
        // Fallback: update settings locally if IPC unavailable
        updateSettings(fallbackSettings);
      });
    } else {
      // Fallback for dev/test
      updateSettings(fallbackSettings);
    }

    if (onSessionComplete) {
      onSessionComplete(newSession);
    }

    // After reflection, transition to break coach!
    handleStartBreak();
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? (secondsRemaining / totalSeconds) * 100 : 0;

  // SVG circular ring metrics
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  // Check today's study minutes for "Enough for today" burnout protection
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMinutes = (settings?.studySessions || [])
    .filter((s) => s.timestamp >= today.getTime())
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const dailyGoal = settings?.dailyGoalMinutes || 60;
  const hasExceededGoal = todayMinutes >= dailyGoal * 1.5;

  return (
    <div
      data-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '540px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                Study Focus Timer & Break Coach
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                {phase === 'focus'
                  ? `Focusing on ${subject}`
                  : phase === 'break'
                    ? 'Break time: Recharging your mind'
                    : phase === 'reflection'
                      ? 'Reflect on your session'
                      : 'Set your intention and start'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Burnout / "Enough for today" gentle banner */}
        {hasExceededGoal && (
          <div
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              borderBottom: '1px solid rgba(234, 179, 8, 0.3)',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <OwlMascot size={28} level={2} isSleepy={true} />
            <div style={{ fontSize: '12px', color: 'var(--text)' }}>
              <strong>Enough for today! 🌟</strong> You’ve studied {todayMinutes}m today (goal was {dailyGoal}m). Great minds know when to rest and let the memory consolidate!
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', textAlign: 'center' }}>
          {/* PHASE: IDLE / CONFIGURATION */}
          {phase === 'idle' && (
            <div>
              {/* Presets (Pomodoro 25/5, Deep Work 50/10) */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                <button
                  onClick={() => {
                    setFocusDurationMinutes(25);
                    setBreakDurationMinutes(5);
                    setSecondsRemaining(25 * 60);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: focusDurationMinutes === 25 ? 'var(--accent)' : 'var(--bg)',
                    color: focusDurationMinutes === 25 ? '#ffffff' : 'var(--text)'
                  }}
                >
                  Pomodoro (25m / 5m)
                </button>
                <button
                  onClick={() => {
                    setFocusDurationMinutes(50);
                    setBreakDurationMinutes(10);
                    setSecondsRemaining(50 * 60);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: focusDurationMinutes === 50 ? 'var(--accent)' : 'var(--bg)',
                    color: focusDurationMinutes === 50 ? '#ffffff' : 'var(--text)'
                  }}
                >
                  Deep Work (50m / 10m)
                </button>
                <button
                  onClick={() => {
                    setFocusDurationMinutes(15);
                    setBreakDurationMinutes(3);
                    setSecondsRemaining(15 * 60);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: focusDurationMinutes === 15 ? 'var(--accent)' : 'var(--bg)',
                    color: focusDurationMinutes === 15 ? '#ffffff' : 'var(--text)'
                  }}
                >
                  Quick Sprint (15m)
                </button>
              </div>

              {/* Session Intention Inputs */}
              <div
                style={{
                  backgroundColor: 'var(--bg)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  marginBottom: '24px',
                  textAlign: 'left'
                }}
              >
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  STUDY SPACE / SUBJECT
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    marginBottom: '12px',
                    outline: 'none'
                  }}
                >
                  {(settings?.spaces || [{ id: 'general', name: 'General Study' }]).map((sp) => (
                    <option key={sp.id} value={sp.name}>
                      {sp.name}
                    </option>
                  ))}
                </select>

                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  SESSION INTENTION (What will you achieve?)
                </label>
                <input
                  type="text"
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="e.g. Read Chapter 5 and do practice problems 1-10"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Start Focus Button */}
              <button
                onClick={handleStartFocus}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <Play size={18} fill="currentColor" />
                <span>Begin {focusDurationMinutes}-Minute Focus</span>
              </button>
            </div>
          )}

          {/* PHASE: FOCUS OR BREAK ACTIVE TICKING COUNTDOWN */}
          {(phase === 'focus' || phase === 'break') && (
            <div>
              {/* Circular SVG Countdown Progress */}
              <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 20px auto' }}>
                <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="110"
                    cy="110"
                    r={radius}
                    stroke="var(--border)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="110"
                    cy="110"
                    r={radius}
                    stroke={phase === 'break' ? '#10b981' : 'var(--accent)'}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>

                {/* Inside circle readout */}
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
                  <span style={{ fontSize: '38px', fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>
                    {formattedTime}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: phase === 'break' ? '#10b981' : 'var(--accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    {phase === 'focus' ? 'Focusing' : 'Break Time'}
                  </span>
                </div>
              </div>

              {/* Intention Reminder during focus */}
              {phase === 'focus' && intention && (
                <div
                  style={{
                    backgroundColor: 'var(--bg)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    display: 'inline-block',
                    marginBottom: '20px',
                    border: '1px solid var(--border)'
                  }}
                >
                  🎯 Working on: <span style={{ color: 'var(--text)', fontWeight: 500 }}>{intention}</span>
                </div>
              )}

              {/* BREAK COACH GUIDANCE during break phase */}
              {phase === 'break' && (
                <div
                  style={{
                    backgroundColor: 'var(--bg)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    marginBottom: '20px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <OwlMascot size={26} level={1} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                      Hootly’s Break Coach Checklist:
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Eye size={15} style={{ color: 'var(--accent)' }} />
                      <span><strong>20-20-20 Rule:</strong> Look at an object 20 feet away for 20 seconds.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Droplets size={15} style={{ color: '#3b82f6' }} />
                      <span><strong>Hydrate:</strong> Drink a refreshing glass of water.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Heart size={15} style={{ color: '#ec4899' }} />
                      <span><strong>Stretch:</strong> Stand up, roll your shoulders, and loosen your neck.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Play / Pause / Reset Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                  <span>{isRunning ? 'Pause' : 'Resume'}</span>
                </button>

                {/* Snooze 5 more minutes on nudges */}
                <button
                  onClick={handleSnoozeFiveMinutes}
                  disabled={snoozeUsed}
                  title={snoozeUsed ? 'You used your 5-minute extension for this focus session' : 'Add 5 more minutes to finish your train of thought'}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    color: 'var(--text)',
                    fontWeight: 500
                  }}
                >
                  {snoozeUsed ? 'Extension Used' : '+5 More Mins'}
                </button>

                <button
                  onClick={handleReset}
                  title="Reset Timer"
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          )}

          {/* PHASE: SESSION REFLECTION */}
          {phase === 'reflection' && (
            <div className="animate-fade-in" style={{ textAlign: 'left' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px 0' }}>
                  Focus session complete!
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Take 10 seconds to reflect on how focused you felt.
                </p>
              </div>

              {/* 1-Tap 5-Star Rating */}
              <div
                style={{
                  backgroundColor: 'var(--bg)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  HOW FOCUSED WERE YOU?
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReflectionRating(star)}
                      style={{
                        background: 'transparent',
                        padding: '6px',
                        cursor: 'pointer',
                        color: star <= reflectionRating ? '#eab308' : 'var(--border)'
                      }}
                    >
                      <Star size={24} fill={star <= reflectionRating ? '#eab308' : 'none'} />
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {reflectionRating === 5 && '🚀 Laser focus! Super productive.'}
                  {reflectionRating === 4 && '✨ Good progress, minor distractions.'}
                  {reflectionRating === 3 && '⚖️ Moderate focus, did okay.'}
                  {reflectionRating <= 2 && '🌧️ Low energy today, but you still showed up!'}
                </div>
              </div>

              {/* Reflection Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  QUICK NOTE (What did you complete or learn?)
                </label>
                <input
                  type="text"
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  placeholder="e.g. Completed problem set #3, stuck on question 8"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Submit & Take Break Button */}
              <button
                onClick={handleCompleteReflection}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Coffee size={18} />
                <span>Save Reflection & Start Break ({breakDurationMinutes}m)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
