# Security policy

Hootly is an early-stage desktop browser built with Electron. Security fixes are welcome, and reports should be shared privately so that users can receive a fix before details become public.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for [this repository](https://github.com/edupotnurusrichandan/hootly/security/advisories/new) when it is available. If private reporting is unavailable, contact the maintainer privately through GitHub. Do not publish exploit details in a public issue.

Include the affected Hootly version, Windows version, clear reproduction steps, and potential impact. Avoid sending passwords, session cookies, personal study records, or other real user data. We will acknowledge reports and coordinate a fix and disclosure timeline with the reporter.

## Security controls

- Website content runs in isolated, sandboxed Electron web contents with Node.js integration disabled and context isolation enabled.
- The Hootly interface uses a Content Security Policy. Website navigation is limited to supported web and Hootly destinations, and popups are routed into browser tabs.
- Website permissions are denied by default. Supported requests such as camera, microphone, location, notifications, clipboard read, and MIDI access require a native Hootly prompt. An approval applies only to the requesting site and tab for up to 15 minutes. Screen sharing and other unsupported permission types remain blocked.
- Google sign-in is opened in the system browser because embedded browser sign-in is restricted by Google.
- Stored credentials use Electron `safeStorage` where the operating system provides it. Study sessions, site-time summaries, and preferences are stored locally in the app's user-data folder.
- Hootly does not currently send analytics or telemetry.

## Scope and limitations

This policy covers the Hootly desktop application and its bundled interface. Hootly is pre-release software and has not had a full independent security audit. Its ad blocker uses a built-in host list and is not an extension or a comprehensive filter-list engine. Website compatibility and security protections may change between releases.

Please install builds only from the [official Hootly GitHub repository and its Releases page](https://github.com/edupotnurusrichandan/hootly/releases). Updates are delivered through GitHub Releases in packaged builds; development runs do not use the updater.
