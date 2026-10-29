import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, CalendarDays, Flame, ShieldCheck, Settings, Trash2 } from 'lucide-react';
import { TabInfo, UserSettings, WeeklyReviewData } from '@shared/types';
import { useTheme } from '../theme/ThemeContext';

type Engine = UserSettings['searchEngine'];
const engineNames: Record<Engine, string> = { google: 'Google', bing: 'Bing', duckduckgo: 'DuckDuckGo', yahoo: 'Yahoo' };

interface Props {
  activeTab: TabInfo;
  onNavigate: (url: string) => void;
  onOpenAppearance: () => void;
}

export const BrowserInternalPage: React.FC<Props> = ({ activeTab, onNavigate, onOpenAppearance }) => {
  const { settings, updateSettings } = useTheme();
  const page = activeTab.url.replace(/^hootly:\/\//i, '').toLowerCase();
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [message, setMessage] = useState('');
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReviewData | null>(null);
  useEffect(() => {
    if (page !== 'review') return;
    let mounted = true;
    window.studyBrowser?.getWeeklyReview().then((summary) => { if (mounted) setWeeklyReview(summary); }).catch(() => { if (mounted) setWeeklyReview(null); });
    return () => { mounted = false; };
  }, [page]);
  const nextExam = useMemo(() => (settings?.exams || []).filter((exam) => Date.parse(exam.examDate) >= new Date().setHours(0, 0, 0, 0)).sort((a, b) => Date.parse(a.examDate) - Date.parse(b.examDate))[0], [settings?.exams]);

  const addExam = async (event: FormEvent) => {
    event.preventDefault();
    if (!examTitle.trim() || !examDate) return;
    await updateSettings({ exams: [...(settings?.exams || []), { id: `exam-${Date.now()}`, title: examTitle.trim(), subject: 'General', examDate, targetHours: 15, completedHours: 0 }] });
    setExamTitle(''); setExamDate(''); setMessage('Exam added.');
  };

  const title = page === 'bookmarks' ? 'Bookmarks' : page === 'adblock' ? 'Ad blocking' : page === 'exams' ? 'Upcoming exams' : page === 'streak' ? 'Study streak' : page === 'review' ? 'Weekly review' : 'Browser settings';
  return (
    <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', color: 'var(--text)', padding: '38px 24px' }}>
      <article style={{ maxWidth: 780, margin: '0 auto' }}>
        <button onClick={() => onNavigate('hootly://dashboard')} style={subtleButton}><ArrowLeft size={15} /> Dashboard</button>
        <h1 style={{ fontSize: 28, margin: '22px 0 6px' }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 24px' }}>Hootly browser controls</p>

        {page === 'settings' && <section style={panel}>
          <h2 style={sectionTitle}><Settings size={18} /> Preferences</h2>
          <label style={row}>Default search engine <select value={settings?.searchEngine || 'google'} onChange={(event) => void updateSettings({ searchEngine: event.target.value as Engine })} style={selectStyle}>{Object.entries(engineNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>
          <button onClick={onOpenAppearance} style={rowButton}>Appearance and themes <ArrowRight size={16} /></button>
          <button onClick={() => onNavigate('hootly://bookmarks')} style={rowButton}>Manage bookmarks <ArrowRight size={16} /></button>
          <button onClick={() => onNavigate('hootly://adblock')} style={rowButton}>Ad blocking <ArrowRight size={16} /></button>
        </section>}

        {page === 'bookmarks' && <section style={panel}>
          {(settings?.bookmarks || []).length ? settings!.bookmarks.map((bookmark) => <div key={bookmark.id} style={row}>
            <button onClick={() => onNavigate(bookmark.url)} style={{ ...textButton, flex: 1, textAlign: 'left' }}><strong>{bookmark.title}</strong><span style={{ display: 'block', color: 'var(--text-muted)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>{bookmark.url}</span></button>
            <button aria-label={`Remove ${bookmark.title}`} title="Remove bookmark" onClick={() => void updateSettings({ bookmarks: settings!.bookmarks.filter((item) => item.id !== bookmark.id) })} style={iconButton}><Trash2 size={16} /></button>
          </div>) : <p style={{ color: 'var(--text-muted)' }}>No bookmarks saved yet. Use the bookmark button beside the address bar to save a page.</p>}
        </section>}

        {page === 'adblock' && <section style={panel}>
          <h2 style={sectionTitle}><ShieldCheck size={18} /> Block known ad and tracking requests</h2>
          <label style={row}><span><strong>Ad blocking</strong><small style={{ display: 'block', color: 'var(--text-muted)', marginTop: 4 }}>Applies to common advertising and tracking hosts.</small></span><input type="checkbox" checked={settings?.adBlockEnabled ?? true} onChange={(event) => void updateSettings({ adBlockEnabled: event.target.checked })} /></label>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>This built-in filter is a basic host list. It does not use Chrome extension filters.</p>
        </section>}

        {page === 'streak' && <section style={panel}><h2 style={sectionTitle}><Flame size={18} /> Current streak</h2><strong style={{ fontSize: 34 }}>{settings?.streakDays || 0} days</strong><p style={{ color: 'var(--text-muted)' }}>Record a study session to keep your learning streak going.</p><button onClick={() => onNavigate('hootly://dashboard')} style={primaryButton}>Back to dashboard <ArrowRight size={15} /></button></section>}

        {page === 'review' && <section style={panel}>
          <h2 style={sectionTitle}><BarChart3 size={18} /> Last 7 days</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 12, marginBottom: 22 }}>
            <Metric label="Study time" value={`${weeklyReview?.totalMinutes ?? 0} min`} />
            <Metric label="Sessions" value={String(weeklyReview?.sessionCount ?? 0)} />
            <Metric label="Daily average" value={`${weeklyReview?.averageMinutesPerDay ?? 0} min`} />
          </div>
          <h3 style={{ fontSize: 14 }}>By subject</h3>
          {weeklyReview?.bySubject.length ? weeklyReview.bySubject.map((item) => <div key={item.subject} style={row}><span>{item.subject}<small style={{ display: 'block', color: 'var(--text-muted)' }}>{item.sessions} sessions</small></span><strong>{item.minutes} min</strong></div>) : <p style={{ color: 'var(--text-muted)' }}>Complete a study session to start your weekly summary.</p>}
          <h3 style={{ fontSize: 14, marginTop: 22 }}>Research sites</h3>
          {weeklyReview?.bySite.length ? weeklyReview.bySite.map((item) => <div key={item.host} style={row}><span>{item.host}</span><strong>{item.minutes} min</strong></div>) : <p style={{ color: 'var(--text-muted)' }}>Active study-site time will appear here as you browse.</p>}
        </section>}

        {page === 'exams' && <section style={panel}>
          <h2 style={sectionTitle}><CalendarDays size={18} /> Next exam</h2>
          {nextExam ? <p><strong>{nextExam.title}</strong><span style={{ color: 'var(--text-muted)' }}> · {new Date(`${nextExam.examDate}T00:00:00`).toLocaleDateString()}</span></p> : <p style={{ color: 'var(--text-muted)' }}>No upcoming exams scheduled.</p>}
          <form onSubmit={addExam} style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 18 }}><input value={examTitle} onChange={(event) => setExamTitle(event.target.value)} placeholder="Exam name" required style={inputStyle} /><input value={examDate} onChange={(event) => setExamDate(event.target.value)} type="date" required style={inputStyle} /><button type="submit" style={primaryButton}>Add exam</button></form>{message && <small style={{ color: 'var(--accent)' }}>{message}</small>}
        </section>}

        <nav style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 18 }}>
          <button onClick={() => onNavigate('hootly://settings')} style={subtleButton}>Settings</button><button onClick={() => onNavigate('hootly://bookmarks')} style={subtleButton}>Bookmarks</button><button onClick={() => onNavigate('hootly://adblock')} style={subtleButton}>Ad blocking</button><button onClick={() => onNavigate('hootly://streak')} style={subtleButton}>Streak</button><button onClick={() => onNavigate('hootly://exams')} style={subtleButton}>Upcoming exam</button><button onClick={() => onNavigate('hootly://review')} style={subtleButton}>Weekly review</button>
        </nav>
      </article>
    </main>
  );
};

const panel: React.CSSProperties = { padding: 22, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface)' };
const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)' }}><small style={{ color: 'var(--text-muted)' }}>{label}</small><strong style={{ display: 'block', fontSize: 22, marginTop: 5 }}>{value}</strong></div>;
const sectionTitle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 9, fontSize: 17, margin: '0 0 18px' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--border)' };
const textButton: React.CSSProperties = { color: 'var(--text)', background: 'transparent', cursor: 'pointer' };
const rowButton: React.CSSProperties = { ...row, width: '100%', color: 'var(--text)', background: 'transparent', cursor: 'pointer', textAlign: 'left' };
const iconButton: React.CSSProperties = { display: 'grid', placeItems: 'center', width: 34, height: 34, color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: 9, cursor: 'pointer' };
const selectStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 8, color: 'var(--text)', background: 'var(--bg)', border: '1px solid var(--border)' };
const inputStyle: React.CSSProperties = { flex: '1 1 180px', minWidth: 150, padding: '10px 12px', borderRadius: 9, color: 'var(--text)', background: 'var(--bg)', border: '1px solid var(--border)' };
const primaryButton: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 9, color: 'var(--bg)', background: 'var(--accent)', cursor: 'pointer' };
const subtleButton: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 9, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' };
