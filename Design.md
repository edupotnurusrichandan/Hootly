\# Hootly Design System

## Mascot: Hootly the owl

\- A friendly, slightly sleepy night owl with big round eyes; simple shapes,

&#x20; easy to animate, drawn with the active theme's colors

\- Moods: waiting (idle), cheering (goal reached), proud (streak grows),

&#x20; dancing (level up), gentle side-eye (nudge when off-task), sleepy (late night)

\- Shown in: new-tab greeting, timer screen, nudge banners, onboarding,

&#x20; empty states

\- Never shames the student; nudges are playful ("Hoot? Back to Math?")

\- Profession themes add a small accessory (stethoscope, gavel, hard hat,

&#x20; graduation cap) without changing the owl's shape

\- Mascot animation respects reduced-motion and can be turned off in Settings



\## Principles

\- Very attractive, friendly, student-focused; calm during study

\- Rounded corners (12-16px), soft shadows, gradient accents, generous spacing

\- Every color comes from the active theme; never hard-code colors

\- Each theme has light and dark modes; text contrast at least 4.5:1

\- Respect prefers-reduced-motion; animations are subtle and short (150-300ms)



\## Theme engine

\- Themes are JSON files in /src/themes (one file per theme)

\- Fields: id, name, type (gradient | profession), light{bg,surface,text,accent},

&#x20; dark{...}, gradient\[from,to], ranks\[], greeting, nudgeStyle

\- The app sets CSS variables on :root: --bg --surface --text --accent

&#x20; --grad-from --grad-to; switching themes updates everything instantly

\- Selected theme and light/dark mode are saved in the settings table



\## Gradient themes

Aurora, Sunset, Ocean, Forest, Sakura, Lavender, Midnight, Mono Focus

(colors as in the table in the plan)



\## Profession themes

Medical, Law, Engineering, Tech, Teaching, Architecture, Science, Business.

Each overrides: palette, rank names for XP levels, greeting text, badge icons.



\## Key screens

1\. Browser shell: rounded tab strip, gradient accent toolbar, address bar

2\. New-tab home: greeting, today's goal ring, streak flame, XP bar, quick links

3\. Timer: large animated progress ring with Pomodoro/stopwatch toggle

4\. Settings: theme picker with live preview cards, light/dark/system switch

5\. Onboarding: pick theme, pick profession (optional), set daily goal



\## Delight

Confetti on goal reached, flame animation on streak, level-up animation.

All can be turned off in Settings.

### Owl Companion Visuals ("Barnaby")
- Perched on the streak flame in the toolbar and New-Tab dashboard
- Streak Flame: Flame scales in height, layers, and glow from 1 day to 7+ days
- Owl XP Accessories:
  - Level 1: Reading Glasses
  - Level 2: Cozy Study Scarf
  - Level 3: Academic Scholar Cap
  - Level 4: Golden Feather Brooch
  - Level 5+: Mystic Quill & Starlight Glow
- Night Bedtime Mode:
  - Triggered after set bedtime (default 10 PM)
  - Owl displays sleepy curved eyes and nightcap with soft floating "z Z Z"
  - Gentle bedtime wrap-up reminder banner to encourage healthy sleep habits
- Sound: Soft synthesized double "hoot" on goal completion (off by default)

