import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Sparkles, ArrowRight, ArrowLeft, Check, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { allThemes, themeId, setThemeId, updateSettings, theme } = useTheme();

  const [step, setStep] = useState<number>(1);
  const [selectedProfession, setSelectedProfession] = useState<string>('tech');
  const [dailyGoal, setDailyGoal] = useState<number>(60);

  if (!isOpen) return null;

  const professionThemes = allThemes.filter((t) => t.type === 'profession');
  const gradientThemes = allThemes.filter((t) => t.type === 'gradient');

  const chosenProfessionTheme = professionThemes.find((t) => t.id === selectedProfession) || professionThemes[0];

  const handleFinish = async () => {
    if (theme.type === 'gradient' && selectedProfession) {
      // If user selected a profession, we can either switch theme or save professionId
      setThemeId(selectedProfession);
    }
    await updateSettings({
      professionId: selectedProfession,
      dailyGoalMinutes: dailyGoal,
      hasCompletedOnboarding: true
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if confetti fails
    }

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '24px'
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '680px',
          maxWidth: '95vw',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Step Indicator Header */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'var(--bg)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Sparkles size={14} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
              Hootly Setup • Step {step} of 3
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  width: '24px',
                  height: '4px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: s <= step ? 'var(--accent)' : 'var(--border)',
                  transition: 'background-color 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div style={{ padding: '28px 24px', minHeight: '320px' }}>
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                Choose Your Study Aesthetic
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Hootly uses calming, theme-driven colors designed to maintain your focus without visual fatigue.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {gradientThemes.slice(0, 8).map((t) => {
                  const isSelected = t.id === themeId;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setThemeId(t.id)}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg)',
                        border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div
                        style={{
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          background: `linear-gradient(135deg, ${t.gradient.from}, ${t.gradient.to})`,
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff'
                        }}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                        {t.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                Choose Your Field of Study
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Unlocks tailored ranks for your XP ladder and custom motivational greetings.
              </p>

              {/* Profession Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {professionThemes.map((p) => {
                  const isSelected = p.id === selectedProfession;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProfession(p.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'var(--bg)' : 'transparent',
                        border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                        color: isSelected ? 'var(--accent)' : 'var(--text)',
                        fontSize: '12px',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>

              {/* Selected Profession Rank Ladder Preview */}
              {chosenProfessionTheme && (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Award size={16} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                      {chosenProfessionTheme.name} Rank Progression
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '4px 0' }}>
                    {chosenProfessionTheme.ranks.map((rankName, idx) => (
                      <React.Fragment key={rankName}>
                        <div
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: idx === 0 ? 'var(--accent)' : 'var(--surface)',
                            color: idx === 0 ? '#ffffff' : 'var(--text-muted)',
                            fontSize: '11px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Lvl {idx + 1}: {rankName}
                        </div>
                        {idx < chosenProfessionTheme.ranks.length - 1 && (
                          <span style={{ color: 'var(--border)', fontSize: '10px' }}>→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                    &ldquo;{chosenProfessionTheme.greeting}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                Set Your Daily Focus Goal
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                How many minutes would you like to dedicate to focused study each day?
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '24px' }}>
                {[30, 45, 60, 90, 120].map((mins) => {
                  const isSelected = dailyGoal === mins;
                  return (
                    <button
                      key={mins}
                      onClick={() => setDailyGoal(mins)}
                      style={{
                        padding: '16px 8px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg)',
                        border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                        color: isSelected ? 'var(--accent)' : 'var(--text)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Clock size={18} />
                      <span style={{ fontSize: '16px', fontWeight: 700 }}>{mins}m</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>daily</span>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5'
                }}
              >
                💡 <strong>Gentle habit tip:</strong> Consistency beats intensity. 45–60 minutes daily maintains strong learning retention and protects your streak!
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: 'var(--bg)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <span>Next</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 22px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span>Start Studying</span>
              <Sparkles size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
