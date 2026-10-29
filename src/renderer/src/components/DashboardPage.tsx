import React, { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Flame, Moon, Search } from 'lucide-react';
import { UserSettings } from '@shared/types';
import { useTheme } from '../theme/ThemeContext';
import { isBedtimeReminderDue } from '@shared/reminders';

type Engine = UserSettings['searchEngine'];
const engines: Record<Engine, { name: string; url: string }> = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  yahoo: { name: 'Yahoo', url: 'https://search.yahoo.com/search?p=' }
};

interface Props {
  onNavigate: (url: string) => void;
}

export const DashboardPage: React.FC<Props> = ({ onNavigate }) => {
  const { settings, updateSettings } = useTheme();
  const [query, setQuery] = useState('');
  const engine: Engine = settings?.searchEngine || 'google';
  const showBedtimePrompt = isBedtimeReminderDue(new Date(), settings?.bedtimeHour ?? 22);
  const nextExam = useMemo(() => (settings?.exams || [])
    .filter((exam) => Number.isFinite(Date.parse(exam.examDate)) && Date.parse(exam.examDate) >= new Date().setHours(0, 0, 0, 0))
    .sort((a, b) => Date.parse(a.examDate) - Date.parse(b.examDate))[0], [settings?.exams]);
  const daysLeft = nextExam ? Math.max(0, Math.ceil((Date.parse(nextExam.examDate) - new Date().setHours(0, 0, 0, 0)) / 86400000)) : null;

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) onNavigate(engines[engine].url + encodeURIComponent(query.trim()));
  };

  return (
    <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)', color: 'var(--text)', padding: 'clamp(28px, 7vh, 72px) 24px 48px' }}>
      <div style={{ width: '100%', maxWidth: 760, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 34 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1.2 }}>HOOTLY</div>
          <h1 style={{ fontSize: 30, margin: '10px 0 6px', letterSpacing: '-0.7px' }}>Your study dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>A clear place to start your next session.</p>
        </header>

        <form onSubmit={submitSearch} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md, 0 8px 30px rgba(0,0,0,.12))' }}>
          <div aria-hidden="true" style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Arial, sans-serif', color: '#4285f4', lineHeight: 1 }}>G</div>
          <input aria-label="Search the web" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search with ${engines[engine].name}`} style={{ flex: 1, minWidth: 0, height: 42, color: 'var(--text)', background: 'transparent', outline: 'none', fontSize: 15 }} />
          <select aria-label="Default search engine" value={engine} onChange={(e) => void updateSettings({ searchEngine: e.target.value as Engine })} style={{ maxWidth: 150, height: 36, color: 'var(--text)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '0 8px' }}>
            {Object.entries(engines).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}
          </select>
          <button aria-label="Search" type="submit" style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 10, color: 'var(--accent)', background: 'var(--bg)' }}><Search size={18} /></button>
        </form>

        {showBedtimePrompt && <aside role="status" style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 16, padding: 14, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}><Moon size={17} color="var(--accent)" /><span>Good work today. Consider wrapping up and getting some rest.</span></aside>}

        <section aria-label="Study overview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginTop: 24 }}>
          <button onClick={() => onNavigate('hootly://streak')} style={cardStyle}>
            <span style={iconStyle}><Flame size={19} /></span>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: 13 }}>Study streak</span>
            <strong style={{ display: 'block', fontSize: 26, marginTop: 5 }}>{settings?.streakDays || 0} days</strong>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--accent)', fontSize: 12, marginTop: 8 }}>Open study timer <ArrowRight size={13} /></span>
          </button>
          <button onClick={() => onNavigate('hootly://exams')} style={cardStyle}>
            <span style={iconStyle}><CalendarDays size={19} /></span>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: 13 }}>Upcoming exam</span>
            {nextExam ? <><strong style={{ display: 'block', fontSize: 18, marginTop: 8 }}>{nextExam.title}</strong><span style={{ display: 'block', color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{daysLeft === 0 ? 'Today' : `${daysLeft} days left`}</span></> : <><strong style={{ display: 'block', fontSize: 16, marginTop: 8 }}>No exam scheduled</strong><span style={{ display: 'block', color: 'var(--accent)', fontSize: 12, marginTop: 7 }}>Add an exam <ArrowRight size={13} style={{ verticalAlign: 'middle' }} /></span></>}
          </button>
        </section>

        <button onClick={() => onNavigate('hootly://review')} style={{ ...linkStyle, display: 'flex', margin: '18px auto 0' }}>View weekly review <ArrowRight size={14} /></button>

        <nav aria-label="Dashboard links" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
          <button onClick={() => onNavigate('hootly://dashboard')} style={linkStyle}>Dashboard</button>
          <button onClick={() => onNavigate('hootly://streak')} style={linkStyle}>Streak</button>
          <button onClick={() => onNavigate('hootly://exams')} style={linkStyle}>Upcoming exam</button>
        </nav>
      </div>
    </main>
  );
};

const cardStyle: React.CSSProperties = { textAlign: 'left', padding: 20, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' };
const iconStyle: React.CSSProperties = { display: 'grid', placeItems: 'center', width: 36, height: 36, marginBottom: 13, borderRadius: 11, color: 'var(--accent)', background: 'var(--bg)' };
const linkStyle: React.CSSProperties = { padding: '9px 15px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer' };
