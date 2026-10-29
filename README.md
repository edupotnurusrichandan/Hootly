<div align="center">

# 🦉 Hootly

### The browser that helps students study smarter, build habits, and stay on track.

**Track your study time. Grow your streaks. Level up your learning.**

![Status](https://img.shields.io/badge/status-early%20development-orange)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![Engine](https://img.shields.io/badge/engine-Blink%20(Chromium)-brightgreen)
![License](https://img.shields.io/badge/license-to%20be%20decided-lightgrey)

</div>

---

## 📖 Table of Contents

1. [About Hootly](#-about-hootly)
2. [Why Hootly Exists](#-why-hootly-exists)
3. [Who Hootly Is For](#-who-hootly-is-for)
4. [Core Philosophy](#-core-philosophy)
5. [Features at a Glance](#-features-at-a-glance)
6. [Feature Deep Dive](#-feature-deep-dive)
   - [Study Timer](#1-study-timer)
   - [Habit Building System](#2-habit-building-system)
   - [Streaks and Daily Goals](#21-streaks-and-daily-goals)
   - [XP, Levels, and Rewards](#22-xp-levels-and-rewards)
   - [Weekly Progress Reports](#23-weekly-progress-reports)
   - [Scheduled Study Reminders](#24-scheduled-study-reminders)
   - [Gentle Focus Nudges](#3-gentle-focus-nudges)
   - [Themes and Personalization](#4-themes-and-personalization)
   - [Data, Storage, and Sync](#5-data-storage-and-sync)
   - [Meet the Owl](#6-meet-the-owl)
7. [How Hootly Compares to a Regular Browser](#-how-hootly-compares-to-a-regular-browser)
8. [Technology](#-technology)
9. [Architecture Overview](#-architecture-overview)
10. [Project Structure](#-project-structure)
11. [Getting Started](#-getting-started)
12. [Development Guide](#-development-guide)
13. [Roadmap](#-roadmap)
14. [Design Principles](#-design-principles)
15. [Privacy and Data Promise](#-privacy-and-data-promise)
16. [Accessibility](#-accessibility)
17. [Security](#-security)
18. [Testing Strategy](#-testing-strategy)
19. [Contributing](#-contributing)
20. [Code of Conduct](#-code-of-conduct)
21. [Frequently Asked Questions](#-frequently-asked-questions)
22. [Glossary](#-glossary)
23. [Credits and Acknowledgements](#-credits-and-acknowledgements)
24. [License](#-license)
25. [Contact](#-contact)

---

## 🦉 About Hootly

**Hootly** is a web browser built specifically for students.

Most browsers are made for everyone, which means they are optimized for no one in particular. They do not know that you are in the middle of an exam week. They do not know that you promised yourself two hours of focused study tonight. They do not care that your streak is at twelve days and one distracted evening could break it.

Hootly does care.

Hootly is a browser that sits beside you while you study. It keeps track of how long you actually spend learning, helps you build habits that last, celebrates your progress, and gently brings you back when your attention drifts. All of this lives inside a browser that is genuinely pleasant to look at and use every day.

Under the hood, Hootly is built on **Blink**, the rendering engine that powers Chromium. That means the websites, tools, and learning platforms you already use work the way you expect. On top of that solid foundation, Hootly adds a layer made just for learning.

> **Project status:** Hootly is in the early planning and development stage. This README describes the vision, the design, and the plan. Features are marked with their current status so you always know what exists today and what is still ahead.

---

## 🎯 Why Hootly Exists

Students today do almost everything in a browser. Lectures, reading, research, notes, assignments, group projects, video lessons, practice quizzes, and past papers all live on the web. The browser is the study desk.

But the browser is also where the distractions live. Social media, videos, games, and endless tabs are one click away from the page you should be reading. A normal browser treats a study session and a scrolling session exactly the same. It has no idea which one you are doing, and it offers no help in making the right choice.

Hootly exists to change that. The idea is simple:

- **If studying happens in the browser, the browser should help you study.**
- **If good habits are built through small daily wins, the browser should help you see and celebrate those wins.**
- **If focus is hard, the browser should support you gently, not punish you.**

The number one goal of Hootly, compared with a general-purpose browser like Chrome, is this:

> **Help students track their study time and build lasting study habits.**

Everything else in the project supports that goal.

---

## 🎓 Who Hootly Is For

Hootly is designed for **both school students and university students**.

| Group | What they need | How Hootly helps |
|-------|----------------|------------------|
| **School students** | Structure, encouragement, and simple routines | Friendly timers, daily goals, rewards, and reminders that make studying feel achievable |
| **University students** | Long-term consistency across heavy workloads | Detailed progress reports, flexible timers, streaks that survive busy seasons, and themes that fit their field |
| **Exam preparers** | Intense, focused sessions | Pomodoro cycles, focus nudges, and clear daily targets |
| **Self-learners** | Motivation without a classroom | Habit tracking, levels, and weekly summaries that show real growth |

If you are someone who wants to learn something and sit in front of a browser while doing it, Hootly is for you.

---

## 💡 Core Philosophy

Four ideas guide every decision in this project.

### 1. Encourage, don't enforce
Hootly uses **gentle nudges only**. It will never lock you out of a website, block your tabs, or make you feel guilty. Students are not children to be controlled. They are capable people who sometimes need a friendly tap on the shoulder. The owl nudges. The owl does not nag.

### 2. Small wins add up
Big goals are built from tiny daily actions. Hootly makes those tiny actions visible through streaks, XP, and progress reports, so that consistency itself becomes rewarding.

### 3. Your data is yours
Study data is personal. Hootly stores your information **locally on your device by default**. Syncing to an account is **optional**, and it is always your choice.

### 4. Beautiful tools get used
A study tool that looks dull gets abandoned. Hootly is designed to be genuinely attractive, with rich gradient themes and personality, because a browser you enjoy opening is a browser that helps you study more.

---

## ✨ Features at a Glance

| Feature | Description | Status |
|---------|-------------|--------|
| 🌐 **Modern browsing** | Built on Blink (Chromium) for broad website compatibility | 🔨 Planned |
| ⏱️ **Pomodoro timer** | Classic focus and break cycles with customizable lengths | 🔨 Planned |
| ⏳ **Free stopwatch** | Open-ended study timing with no preset limit | 🔨 Planned |
| 🔥 **Streaks** | Track consecutive days of meeting your study goal | 🔨 Planned |
| 🎯 **Daily goals** | Set and reach a study target every day | 🔨 Planned |
| ⭐ **XP and levels** | Earn experience for studying and level up over time | 🔨 Planned |
| 🏆 **Rewards** | Unlock rewards as you hit milestones | 🔨 Planned |
| 📊 **Weekly progress reports** | A clear summary of your week of studying | 🔨 Planned |
| 🔔 **Study reminders** | Scheduled nudges to start your study session | 🔨 Planned |
| 🕊️ **Gentle focus nudges** | Soft reminders when your attention wanders | 🔨 Planned |
| 🎨 **Gradient themes** | Beautiful color-graded themes | 🔨 Planned |
| 🩺 **Profession themes** | Themes inspired by careers like doctor, lawyer, and more | 🔨 Planned |
| 💾 **Local-first storage** | Your data stays on your device | 🔨 Planned |
| ☁️ **Optional account sync** | Sync progress across devices if you choose | 🔨 Planned |
| 🦉 **Owl mascot** | A friendly guide with personality | 🔨 Planned |
| 🤖 **AI study features** | Smart study assistance, coming after the core is solid | 🕐 Later |

**Legend:** ✅ Done · 🔨 Planned · 🚧 In progress · 🕐 Later

---

## 🔍 Feature Deep Dive

### 1. Study Timer

Time is the heart of studying, so the timer is the heart of Hootly. It offers **two modes**, because different students (and different days) call for different tools.

#### 🍅 Pomodoro Mode

The Pomodoro technique splits studying into focused intervals separated by short breaks. It is one of the most popular study methods in the world, and Hootly makes it effortless.

- Start a focus session with one click.
- Work until the timer ends, then take a short break.
- After several rounds, enjoy a longer break.
- **Fully customizable lengths:** choose your own focus length, short break length, long break length, and number of rounds before a long break.

Not everyone works best in 25-minute blocks. Some students prefer 50 minutes of focus, others prefer 15. Hootly lets you set the rhythm that suits you.

#### ⏳ Free Stopwatch Mode

Sometimes you do not want a timer ticking down. You just want to sit down, study for as long as it takes, and have the time recorded. Stopwatch mode counts up from zero and keeps going until you decide to stop.

- Start and pause whenever you like.
- Perfect for deep reading, long problem sets, or writing sessions.
- Your total time still counts toward goals, streaks, XP, and reports.

#### Why both?

Because forcing one method on every student defeats the purpose. A schoolchild revising for a quiz and a medical student working through a long case study have very different needs. Hootly supports both.

---

### 2. Habit Building System

The most important thing Hootly offers beyond a normal browser is **help building habits**. Studying once is easy. Studying every day is hard. Hootly includes four connected tools that work together to make consistency feel natural and rewarding.

#### 2.1 Streaks and Daily Goals

- **Daily goal:** Choose how much you want to study each day. Start small if you like. A goal you can actually reach is better than one that overwhelms you.
- **Streak:** Every day you reach your goal, your streak grows by one. Watch the number climb and feel the motivation to keep it alive.
- **Visual progress:** A clear display shows how close you are to today's goal.

A streak is powerful because it turns "I should study" into "I don't want to break my streak."

#### 2.2 XP, Levels, and Rewards

- **Earn XP** (experience points) for time spent studying.
- **Level up** as your XP grows, watching your progress move forward over weeks and months.
- **Unlock rewards** at milestones, such as new themes, owl accessories, or badges.

This turns long-term effort into something you can see and feel, like a game where the prize is real learning.

> **Note:** The exact XP values, level thresholds, and rewards are still being designed. See the [Roadmap](#-roadmap) for details.

#### 2.3 Weekly Progress Reports

Once a week, Hootly summarizes how your studying went. A report might show:

- Total time studied this week
- Which days were your strongest
- How many daily goals you reached
- Your current and longest streaks
- XP earned and level progress
- A comparison with the previous week

Seeing your progress laid out clearly helps you spot patterns, celebrate improvement, and plan better weeks ahead.

#### 2.4 Scheduled Study Reminders

Set the times you want to study, and Hootly will remind you when it is time to begin.

- Choose days and times that fit your routine.
- Build a predictable study rhythm.
- Reminders are friendly and easy to adjust or turn off.

Habits form fastest when they happen at the same time each day. Reminders help you anchor studying to your schedule.

---

### 3. Gentle Focus Nudges

Staying focused is a skill, and everyone drifts sometimes. Hootly handles this with **gentle nudges only**.

- If you are in a study session and wander toward a distraction, the owl may offer a soft reminder.
- Nudges are friendly in tone, never shaming.
- Nothing is ever blocked or locked.
- You are always in control and can dismiss a nudge instantly.

**Why not strict blocking?** Because forced restrictions often create resentment and workarounds. Students who choose to stay focused build real self-discipline, which lasts far longer than any blocker. Hootly's job is to support your choices, not to make them for you.

---

### 4. Themes and Personalization

A browser you will spend hours in should feel good to look at. Hootly puts a lot of care into visual design, aiming to be **very attractive and student-focused**.

#### 🌈 Gradient Themes

Color-graded themes use smooth gradients to create a vibrant, modern look. Imagine calm sunrise blends for morning study, deep twilight tones for late-night sessions, and fresh greens and blues for focus.

#### 👩‍⚕️ Profession-Based Themes

Hootly also offers themes inspired by the careers students are working toward. Examples include:

| Theme | Inspiration |
|-------|-------------|
| 🩺 **Doctor** | Clean, calm clinical tones with a caring feel |
| ⚖️ **Lawyer** | Rich, classic, professional colors |
| More to come | Engineer, teacher, designer, scientist, and others |

Studying for a goal feels more meaningful when your workspace reflects who you are becoming. A future doctor can study in a doctor-themed browser, and a future lawyer can study in theirs.

---

### 5. Data, Storage, and Sync

#### 💾 Local First

By default, everything Hootly records, including study time, streaks, XP, and reports, is **stored on your own device**. You do not need an account to use Hootly fully.

#### ☁️ Optional Account Sync

If you want your progress available across devices, you can **choose** to create an account and turn on sync. This is entirely optional. If you never want an account, you never need one.

This approach respects privacy while still giving students who want it the convenience of syncing.

---

### 6. Meet the Owl

Every great study companion needs a face. Hootly's mascot is an **owl**, a classic symbol of wisdom and late-night studying.

The owl:

- Cheers you on when you hit a goal
- Gives gentle nudges when you drift
- Celebrates level-ups and streaks
- Adds warmth and personality to the whole experience

The name **Hootly** comes from the owl's hoot, combined with a friendly, easy-to-say ending. It is meant to feel approachable, memorable, and a little bit playful.

---

## ⚖️ How Hootly Compares to a Regular Browser

| Capability | A general-purpose browser | Hootly |
|-----------|---------------------------|--------|
| Browse the modern web | ✅ | ✅ |
| Track how long you study | ❌ | ✅ |
| Built-in Pomodoro and stopwatch | ❌ | ✅ |
| Daily goals and streaks | ❌ | ✅ |
| XP, levels, and rewards | ❌ | ✅ |
| Weekly study reports | ❌ | ✅ |
| Study reminders | ❌ | ✅ |
| Gentle focus support | ❌ | ✅ |
| Student-focused themes | ❌ | ✅ |
| Local-first data with optional sync | Varies | ✅ |

Hootly is not trying to replace the web. It is trying to make the web a better place to learn.

---

## 🛠️ Technology

| Area | Choice | Notes |
|------|--------|-------|
| **Browser engine** | **Blink** (Chromium's rendering engine) | Chosen after considering Chromium, WebKit, and Gecko |
| **Development tool** | **Antigravity** | Used to build and iterate on the project |
| **UI approach** | Customized browser interface, designed in the way Electron-style apps customize their UI | Allows a fully custom look and feel |
| **First platform** | **Windows** | Other platforms may follow later |
| **Data storage** | Local storage on the device | With optional account-based sync |

#### Why Blink?

Blink is the engine behind Chromium. Choosing it means:

- **Excellent compatibility.** Most websites are tested against Chromium-based browsers, so they work smoothly.
- **Modern standards.** Support for the latest web technologies.
- **Large ecosystem.** A huge community, documentation, and tooling.
- **Strong performance.** A mature, heavily optimized engine.

The other engines considered, **WebKit** and **Gecko**, are excellent too. Blink was chosen for its compatibility and ecosystem, which matter a lot for a browser that students will use for every kind of site.

---

## 🏗️ Architecture Overview

At a high level, Hootly has three layers that work together:

```
┌──────────────────────────────────────────────────┐
│                  HOOTLY INTERFACE                │
│   Custom UI · Themes · Owl mascot · Study panel  │
├──────────────────────────────────────────────────┤
│                 STUDY ENGINE (Hootly)            │
│  Timer · Goals · Streaks · XP · Reports ·        │
│  Reminders · Focus nudges                        │
├──────────────────────────────────────────────────┤
│                  BROWSER CORE                    │
│        Blink rendering engine (Chromium)         │
├──────────────────────────────────────────────────┤
│                   DATA LAYER                     │
│   Local storage  ·  Optional account sync        │
└──────────────────────────────────────────────────┘
```

#### Layer descriptions

- **Hootly Interface:** Everything you see and click. The customized browser window, tabs, address bar, themes, and the owl.
- **Study Engine:** The brain of Hootly's study features. It handles timing, goal tracking, streak logic, XP calculations, report generation, reminders, and nudges.
- **Browser Core:** The Blink engine that actually loads and displays web pages.
- **Data Layer:** Stores all study data locally and, if enabled, syncs it to an account.

> This diagram is a simplified plan. The real architecture will be refined as development progresses.

---

## 📁 Project Structure

The folder layout below is a **proposed starting point**. It will evolve as the project grows.

```
hootly/
├── README.md                  ← You are here
├── LICENSE                    ← License file (to be added)
├── CONTRIBUTING.md            ← How to contribute (to be added)
├── CODE_OF_CONDUCT.md         ← Community standards (to be added)
│
├── docs/                      ← Documentation and design notes
│   ├── vision.md
│   ├── features.md
│   ├── design-system.md
│   └── roadmap.md
│
├── src/                       ← Source code
│   ├── browser/               ← Browser shell and window management
│   ├── ui/                    ← Interface components and layouts
│   ├── themes/                ← Gradient and profession-based themes
│   ├── study/                 ← Timer, goals, streaks, XP, reports
│   ├── reminders/             ← Scheduled study reminders
│   ├── nudges/                ← Gentle focus nudges
│   ├── mascot/                ← Owl animations and messages
│   ├── storage/               ← Local storage and optional sync
│   └── utils/                 ← Shared helper code
│
├── assets/                    ← Images, icons, fonts, owl artwork
│   ├── owl/
│   ├── icons/
│   └── themes/
│
└── tests/                     ← Automated tests
```

---

## 🚀 Getting Started

> ⚠️ **Hootly is in early development.** There is no downloadable release yet. This section describes how things will work so the plan is clear from the start.

### For Users (Planned)

Once the first version is released:

1. **Download** the Hootly installer for Windows from the Releases page.
2. **Run** the installer and follow the steps.
3. **Open Hootly** and choose your theme.
4. **Set your daily goal** and, if you like, your study reminders.
5. **Start browsing and studying.** Press the timer, begin your session, and let the owl cheer you on.

### Quick First-Day Guide (Planned)

| Step | Action |
|------|--------|
| 1 | Pick a theme that makes you want to study |
| 2 | Set a small, reachable daily goal |
| 3 | Choose Pomodoro or Stopwatch mode |
| 4 | Study your first session |
| 5 | Watch your first streak begin |

### For Developers

If you would like to follow along or contribute to development:

```bash
# 1. Clone the repository
git clone https://github.com/edupotnurusrichandan/hootly.git

# 2. Move into the project folder
cd hootly

# 3. Follow the setup steps in the Development Guide below
```

> Replace the repository URL above with your actual repository address if it differs.

---

## 🧑‍💻 Development Guide

> This guide will be filled in with exact commands as the project takes shape. The structure below shows what it will cover.

### Requirements (Planned)

- A computer running **Windows** (the first supported platform)
- **Antigravity** as the development environment
- A Git installation for version control
- Any additional tools required by the Blink and Chromium build process (details to be added)

### Setting Up Your Environment

1. Install Git.
2. Install Antigravity.
3. Clone the Hootly repository.
4. Open the project folder in Antigravity.
5. Follow the build instructions (to be added as the project develops).

### Branching and Commits

A simple, beginner-friendly workflow keeps the project tidy.

- **`main`** holds the stable, working version of the project.
- **Feature branches** hold work in progress. Name them clearly, for example `feature/pomodoro-timer` or `fix/streak-reset-bug`.
- **Commit messages** should be short and clear, describing what changed. Examples:
  - `Add Pomodoro timer settings`
  - `Fix streak not updating at midnight`
  - `Create doctor theme colors`

### Suggested Workflow

```
1. Create a branch for your change
2. Make small, focused changes
3. Test that everything still works
4. Commit with a clear message
5. Push your branch to GitHub
6. Open a Pull Request describing what you did
```

### Coding Style

- Keep code **simple and readable** over clever.
- Use **clear names** for files, functions, and variables.
- Add **comments** to explain anything that is not obvious.
- Prefer **small functions** that do one thing well.

---

## 🗺️ Roadmap

Hootly will be built in stages so there is always something working and testable. The phases below are a **plan**, not a promise, and will adjust as things are learned.

### Phase 0: Foundation 🔨
- [ ] Finalize project name, mascot concept, and visual direction
- [ ] Set up the repository and basic documentation
- [ ] Decide on project structure
- [ ] Set up the development environment in Antigravity

### Phase 1: A Working Browser Shell 🔨
- [ ] Get a basic window running on Blink (Chromium)
- [ ] Add tabs, an address bar, and back/forward/reload navigation
- [ ] Load websites reliably
- [ ] Create the first version of the custom interface

### Phase 2: The Study Timer 🔨
- [ ] Build the Pomodoro timer
- [ ] Add customizable focus, break, and round settings
- [ ] Build the free stopwatch mode
- [ ] Record study sessions locally

### Phase 3: Habit Building 🔨
- [ ] Daily goals
- [ ] Streak tracking
- [ ] XP and level system
- [ ] Rewards and milestones
- [ ] Study time history

### Phase 4: Reports and Reminders 🔨
- [ ] Weekly progress reports
- [ ] Scheduled study reminders
- [ ] Gentle focus nudges

### Phase 5: Look and Feel 🔨
- [ ] Gradient theme collection
- [ ] Profession-based themes (doctor, lawyer, and more)
- [ ] Owl mascot artwork and animations
- [ ] Polish, smooth transitions, and attention to detail

### Phase 6: Sync and Accounts 🔨
- [ ] Optional account creation
- [ ] Optional cloud sync of study data
- [ ] Clear privacy controls

### Phase 7: First Public Release 🔨
- [ ] Thorough testing on Windows
- [ ] Installer and release packaging
- [ ] Documentation for users
- [ ] Public release of version 1.0

### Phase 8: The Future 🕐
- [ ] **AI study features**, added once the core is solid and dependable
- [ ] Support for additional platforms
- [ ] More themes and rewards
- [ ] Community-requested features

> **A note on AI:** AI-powered study features are intentionally planned for *later*. The goal is to make the core of Hootly excellent first: the timer, the habits, and the experience. AI will be added only once that foundation is strong.

---

## 🎨 Design Principles

These principles guide how Hootly looks, feels, and behaves.

1. **Student-first.** Every screen is designed with a student's day in mind.
2. **Beautiful by default.** Attractive design is a feature, not a luxury.
3. **Calm, not cluttered.** Studying needs a clear head. The interface stays clean.
4. **Encouraging tone.** The owl celebrates and supports. It never scolds.
5. **Respect the user's choices.** Nudges guide. Nothing is forced.
6. **Simple first, powerful second.** Easy to start, with depth for those who want it.
7. **Consistent and predictable.** Things work the way you expect them to.
8. **Delightful details.** Small touches, like a happy owl animation at a level-up, make a big difference.

### Color and Theme Guidance

- Gradients should feel **smooth and calming**, never harsh or distracting.
- Text must always remain **easy to read** against any theme background.
- Profession themes should feel **inspired by** the field, using tasteful colors and accents rather than clichés.
- Every theme should work for **long study sessions** without tiring the eyes.

---

## 🔒 Privacy and Data Promise

Studying is personal, and so is the data about it. Hootly is built on these commitments:

- **Local by default.** Your study data stays on your device unless *you* choose otherwise.
- **Sync is optional.** You never need an account to use Hootly.
- **Transparency.** Hootly will be clear about what is stored and why.
- **Control.** You will be able to view, export, and delete your study data.
- **No pressure.** Turning off reminders, nudges, or sync should always be simple.

> The detailed privacy policy will be written and published before any public release.

---

## ♿ Accessibility

A study tool should be usable by every student. Hootly aims to support:

- **Readable text** with good contrast on every theme
- **Keyboard navigation** for all major features
- **Adjustable sizes** for text and interface elements
- **Clear, simple language** throughout the interface
- **Gentle animations** that can be reduced or turned off for those who prefer it

Accessibility is a goal from the very start, not an afterthought.

---

## 🛡️ Security

Because Hootly is a browser, security matters deeply.

- **Built on a trusted engine.** Blink and Chromium have a strong security track record and active maintenance.
- **Staying up to date.** Keeping the engine current is essential to staying safe.
- **Careful handling of data.** Study data is treated as personal information.
- **Responsible disclosure.** If you discover a security issue, please report it privately rather than posting it publicly. Contact details will be added in a `SECURITY.md` file.

---

## 🧪 Testing Strategy

Good testing keeps Hootly reliable. The plan includes:

| Type of test | What it checks |
|--------------|----------------|
| **Manual testing** | Real use of the browser, timers, and features |
| **Automated tests** | Study logic such as streaks, XP, and report calculations |
| **Edge case checks** | Midnight rollovers, time zone changes, paused timers, and closing the browser mid-session |
| **Visual checks** | Themes look right and text stays readable |
| **Compatibility checks** | Popular learning websites load and work correctly |

### Tricky Cases to Test Carefully

Habit tracking has some subtle situations that deserve special attention:

- A study session that **crosses midnight**
- Changing the **time zone** while a streak is active
- Closing the browser **during a running timer**
- Computer **sleeping** during a session
- **Syncing** progress after using the browser offline

---

## 🤝 Contributing

Contributions of all kinds are welcome, whether you write code, design themes, draw owl artwork, test features, improve documentation, or simply share an idea.

### Ways to Help

- 🐛 **Report bugs.** Tell us what went wrong and how to reproduce it.
- 💡 **Suggest features.** Share ideas that would help students study better.
- 🎨 **Design.** Create theme concepts, owl art, or interface mockups.
- 📝 **Improve docs.** Clear documentation helps everyone.
- 🧑‍💻 **Write code.** Pick up an issue and make it happen.
- 🧪 **Test.** Try early builds and report what you find.

### How to Contribute Code

1. **Fork** the repository.
2. **Create a branch** for your change.
3. **Make your changes**, keeping them focused and tidy.
4. **Test** that everything works.
5. **Commit** with a clear message.
6. **Push** your branch and open a **Pull Request**.
7. **Describe** what you changed and why.

### Pull Request Checklist

- [ ] My change does one clear thing
- [ ] I tested it and it works
- [ ] I updated documentation if needed
- [ ] My code is readable and commented where helpful
- [ ] My commit messages are clear

### First-Time Contributors

New to open source? That is wonderful. Look for issues labeled **`good first issue`** once they are available. Questions are always welcome, and nobody will make you feel small for asking.

---

## 📜 Code of Conduct

Hootly is built for students, and the community around it should be kind, safe, and welcoming.

- **Be respectful.** Treat everyone with kindness and courtesy.
- **Be patient.** People are at different skill levels, and everyone starts somewhere.
- **Be constructive.** Give feedback that helps, not feedback that hurts.
- **Be inclusive.** Welcome people of every background, age, and experience level.
- **No harassment.** Harassment, discrimination, and personal attacks are not acceptable.

A full Code of Conduct file will be added to the repository.

---

## ❓ Frequently Asked Questions

**Q: What is Hootly?**
A: Hootly is a study-focused web browser for students. It helps you track study time, build habits, and stay focused, all inside a beautifully designed browser.

**Q: Is Hootly available to download?**
A: Not yet. Hootly is in early development. Watch this repository for updates.

**Q: Which platforms will Hootly support?**
A: Windows first. Other platforms may come later.

**Q: Is Hootly free?**
A: Pricing and licensing have not been decided yet. This README will be updated once they are.

**Q: Will Hootly block distracting websites?**
A: No. Hootly uses **gentle nudges only**. It will never lock you out of a site. You stay in control.

**Q: Do I need an account?**
A: No. Hootly stores your data locally on your device. Accounts and sync are completely optional.

**Q: Will my study data be shared?**
A: Your data stays on your device by default. If you choose to enable sync, that is your decision, and privacy controls will be clear.

**Q: What browser engine does Hootly use?**
A: Blink, the engine behind Chromium. This gives excellent website compatibility.

**Q: Why Blink instead of WebKit or Gecko?**
A: All three are excellent. Blink was chosen for its broad compatibility, modern standards support, and large ecosystem.

**Q: What kinds of timers does Hootly have?**
A: Two: a customizable **Pomodoro** timer and a **free stopwatch**.

**Q: What are profession-based themes?**
A: Themes inspired by careers, such as doctor and lawyer, so students can study in a workspace that reflects their goals.

**Q: Will Hootly have AI features?**
A: Yes, but later. The plan is to build an excellent core experience first and add AI once that foundation is solid.

**Q: Is Hootly for school students or university students?**
A: Both.

**Q: Why an owl?**
A: Owls are a classic symbol of wisdom and late-night studying, and the name Hootly comes from the owl's hoot.

**Q: How can I help?**
A: See the [Contributing](#-contributing) section. Bug reports, ideas, designs, and code are all welcome.

**Q: I am a beginner. Can I still contribute?**
A: Absolutely. Everyone starts somewhere, and documentation, testing, and design contributions are just as valuable as code.

---

## 📚 Glossary

| Term | Meaning |
|------|---------|
| **Blink** | The browser engine that powers Chromium, responsible for displaying web pages |
| **Chromium** | The open-source browser project that many popular browsers are built on |
| **Browser engine** | The part of a browser that turns website code into the pages you see |
| **Pomodoro** | A study method that alternates focused work intervals with short breaks |
| **Stopwatch mode** | A timer that counts up from zero until you stop it |
| **Streak** | The number of consecutive days you have reached your daily goal |
| **Daily goal** | The amount of study time you aim to complete each day |
| **XP** | Experience points earned for studying |
| **Level** | A milestone reached by collecting enough XP |
| **Nudge** | A gentle, non-forcing reminder to refocus |
| **Local-first** | Storing data on your own device by default |
| **Sync** | Keeping your data consistent across multiple devices through an account |
| **Gradient theme** | A theme that blends smoothly between two or more colors |
| **Profession theme** | A theme inspired by a career field, such as doctor or lawyer |
| **Antigravity** | The development tool used to build Hootly |
| **Repository** | The project folder stored on GitHub that holds all of Hootly's files |
| **Pull Request** | A proposal to add your changes to the project |

---

## 🙏 Credits and Acknowledgements

- **The Chromium and Blink communities**, whose open-source work makes a project like this possible.
- **Everyone who has ever struggled to stay focused while studying**, who inspired this project.
- **Future contributors**, whose ideas, art, and code will help Hootly grow.
- **Students everywhere**, who are the reason Hootly exists.

*(This section will grow as contributors join and as third-party tools and assets are used.)*

---

## 📄 License

The license for Hootly has **not been decided yet**. A `LICENSE` file will be added to the repository once a choice is made. Until then, please contact the project owner before reusing any part of the project.

> Because Hootly builds on Chromium and Blink, which have their own open-source licenses, the final licensing will take those into account.

---

## 📬 Contact

- **GitHub:** [@edupotnurusrichandan](https://github.com/edupotnurusrichandan)
- **Issues and ideas:** Please use the repository's **Issues** tab.

---

<div align="center">

### 🦉 Study well. Build habits. Hoot hoot!

*Made with care for students everywhere.*

</div>
