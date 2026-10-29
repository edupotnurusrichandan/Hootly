# Hootly (StudyBrowser)

A Windows desktop browser for school and university students, built on Electron (Chromium/Blink).
Core purpose: track study time, build sustainable habits, and provide gentle focus companionship without punishment.

Mascot: **Hootly** (a calm, encouraging study owl mentor).

## Users
School and university students. Some are under 18, so privacy comes first:
- Local-first architecture (SQLite on-device)
- No telemetry or remote code execution in browser UI
- Zero data leaves the device by default

## Stack
- Electron (Chromium/Blink), TypeScript (strict mode), React 18/19
- Vite + esbuild (lightning-fast development and compilation)
- SQLite via better-sqlite3 (local-first data store)
- electron-builder (Windows NSIS installer)

## Security Rules
- `contextIsolation: true`, `nodeIntegration: false` for web content
- All main/UI communication through a strictly typed allowlist
- No remote code in the browser UI
- Sandboxed web content views with secure pop-up redirection

## Product Vision & Feature Catalog

### 1. Habit Engine Boosters
- **Rest-Day Tokens**: Streaks survive a missed day with a rest token; bad days don't erase weeks of hard work.
- **Study Heatmap**: GitHub-style calendar grid where darker tiles signify deeper study time.
- **Exam Countdowns**: Enter exam dates; Hootly displays days remaining and suggests target minutes.
- **Quests**: Daily & weekly mini-challenges (e.g. "study 2 subjects", "finish session before 8 PM") for bonus XP.
- **Session Intention & Reflection**: "What will you work on?" before, and a 1-tap focus rating after.
- **Smart Goal Suggestion**: Recommends next week's daily goal based on recent rolling history.

### 2. Focus Helpers (Gentle, Never Punishing)
- **Parking Lot**: Quick-note button (`Ctrl+Shift+P`) to park stray thoughts without leaving the page.
- **"5 More Minutes" on Nudges**: Students can snooze a nudge once; Hootly respects it. Never hard-blocks.
- **Break Coach**: During intervals, Hootly suggests stretches, hydration, and the 20-20-20 eye relief rule.
- **Floating Mini Timer**: Always-on-top compact clock visible across any workspace.
- **Per-Subject Site Time**: Shows which research sites genuinely supported each academic subject.

### 3. Study Tools Inside the Browser
- **Command Palette (`Ctrl+K`)**: Fast keyboard launcher to switch subjects, open tabs, or park thoughts.
- **Reading Mode**: Distraction-free reader with OpenDyslexic font and an interactive focus ruler.
- **Citation Copy**: One-click copying of academic citations (APA, MLA, Chicago, BibTeX).
- **Ambient Sounds**: Synthesized offline rain, library/cafe murmur, and white noise.
- **Study Spaces**: Subject-dedicated spaces with grouped tabs, notes, and timers.
- **Highlight to Flashcard**: Select text on any web page and save it directly as a flashcard.
- **Deadline Planner**: Local `.ics` calendar file import displaying upcoming assignment dues.

### 4. Wellbeing & Healthy Limits
- **"Enough for Today"**: Encouraging anti-burnout banner after hitting milestone sessions.
- **Sleepy Bedtime Wind-Down**: After a configurable evening hour (e.g. 10 PM), Hootly dons a nightcap and encourages rest.
- **Weekly Review**: Qualitative reflection and actionable insights rather than cold numbers.

### 5. Owl Companion & Gamification
- **Owl Evolution**: Hootly evolves from owlet to scholar to wise elder owl as XP accumulates.
- **Unlockable Accessories**: Glasses, scarves, graduation cap, golden feathers earned through streaks.
- **Seasonal & Exam Outfits**: Special attire during exam weeks and winter seasons.
- **Rotating Study Tips**: Evidence-based study techniques on the home screen.

### 6. Accessibility & Inclusivity
- Dyslexia-friendly typography (OpenDyslexic toggle)
- High contrast modes & dynamic text scaling
- Full keyboard shortcut accessibility
- `prefers-reduced-motion` compliance across all animations

## Milestones Roadmap
1. **Tabs & Navigation**: Multi-tab WebContentsView, Address bar, Back/Forward/Reload, Shortcuts (Completed).
2. **Visual Shell & Design Foundation**: Frameless window, Theme engine, 16 Themes, Hootly Owl, Onboarding (Completed).
3. **Study Timer & Break Coach**: Pomodoro, Break Coach (20-20-20 rule, hydration, stretch), Session intention & reflection rating, Burnout banner (Completed).
4. **Productivity & Study Tools**: Command Palette (Ctrl+K), Distraction Parking Lot (Ctrl+Shift+P), One-click Citations (APA/MLA/BibTeX), Local Ambient Sounds, Focus Ruler (Completed).
5. **Goals, Streaks & Heatmap**: 12-week GitHub-style study heatmap, Rest-Day Tokens, Exam countdown pace calculator, Smart goal recommendations (Completed).
6. **XP, Quests & Owl Evolution**: Daily & weekly quests with bonus XP, Level & rank progression, Streak flame & accessories (Completed).
7. **Session Persistence**: SQLite database schema for persistent study records and weekly analytics (Completed).
8. **Reminders & Wind-Down**: Windows native notifications, Bedtime prompts, Ambient audio generator (Completed).
9. **Weekly Review Dashboard**: Holistic study reports, Subject breakdown, Site productivity metrics (Completed).
10. **Installer & Polished Beta**: electron-builder Windows installer, performance optimization (Completed).

## Working Rules
- Explain what you did in plain language; the developer is a beginner.
- Make small changes, one milestone at a time, and commit after each.
- Write tests for habit logic (streaks, XP, goal calculation, rest tokens).
- Run the app and show screenshots before saying a task is done.
