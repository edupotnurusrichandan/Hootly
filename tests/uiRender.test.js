const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { loadTypeScript } = require('./loadTypeScript');

const root = path.join(__dirname, '..');

function renderWithSettings(componentPath, exportName, props, settings) {
  const reminders = loadTypeScript(path.join(root, 'src', 'shared', 'reminders.ts'));
  const { [exportName]: Component } = loadTypeScript(componentPath, {
    '@shared/reminders': reminders,
    '../theme/ThemeContext': {
      useTheme: () => ({ settings, updateSettings: async () => undefined })
    }
  });
  return renderToStaticMarkup(React.createElement(Component, props));
}

describe('Hootly dashboard and internal pages', () => {
  test('renders a simple search-first dashboard with study context', () => {
    const html = renderWithSettings(
      path.join(root, 'src', 'renderer', 'src', 'components', 'DashboardPage.tsx'),
      'DashboardPage',
      { onNavigate: () => undefined },
      {
        searchEngine: 'google',
        streakDays: 7,
        bedtimeHour: 22,
        exams: [{ id: 'exam-1', title: 'Biology', subject: 'Biology', examDate: '2026-11-05', targetHours: 20, completedHours: 0 }]
      }
    );
    assert.match(html, /Your study dashboard/);
    assert.match(html, /aria-label="Search the web"/);
    assert.match(html, /aria-label="Default search engine"/);
    assert.match(html, /Study streak/);
    assert.match(html, /7 days/);
    assert.match(html, /Upcoming exam/);
    assert.match(html, /Biology/);
    assert.match(html, /View weekly review/);
  });

  test('renders browser settings and ad-block controls without an external web view', () => {
    const settings = { searchEngine: 'bing', adBlockEnabled: true, bookmarks: [], exams: [], spaces: [] };
    const html = renderWithSettings(
      path.join(root, 'src', 'renderer', 'src', 'components', 'BrowserInternalPage.tsx'),
      'BrowserInternalPage',
      { activeTab: { id: 'tab-1', url: 'hootly://settings', title: 'Settings', isNewTab: true }, onNavigate: () => undefined, onOpenAppearance: () => undefined },
      settings
    );
    assert.match(html, /Browser settings/);
    assert.match(html, /Default search engine/);
    assert.match(html, /Manage bookmarks/);
    assert.match(html, /Ad blocking/);
  });

  test('renders saved bookmarks as openable rows with remove controls', () => {
    const html = renderWithSettings(
      path.join(root, 'src', 'renderer', 'src', 'components', 'BrowserInternalPage.tsx'),
      'BrowserInternalPage',
      { activeTab: { id: 'tab-1', url: 'hootly://bookmarks', title: 'Bookmarks', isNewTab: true }, onNavigate: () => undefined, onOpenAppearance: () => undefined },
      { searchEngine: 'google', adBlockEnabled: true, bookmarks: [{ id: 'b-1', title: 'Study site', url: 'https://example.org', createdAt: 1 }], exams: [], spaces: [] }
    );
    assert.match(html, /Study site/);
    assert.match(html, /https:\/\/example.org/);
    assert.match(html, /Remove Study site/);
  });
});
