import { ThemeDefinition } from '../shared/types';

import aurora from './aurora.json';
import sunset from './sunset.json';
import ocean from './ocean.json';
import forest from './forest.json';
import sakura from './sakura.json';
import lavender from './lavender.json';
import midnight from './midnight.json';
import monoFocus from './mono-focus.json';

import medical from './medical.json';
import law from './law.json';
import engineering from './engineering.json';
import tech from './tech.json';
import teaching from './teaching.json';
import architecture from './architecture.json';
import science from './science.json';
import business from './business.json';

export const ALL_THEMES: ThemeDefinition[] = [
  aurora as ThemeDefinition,
  sunset as ThemeDefinition,
  ocean as ThemeDefinition,
  forest as ThemeDefinition,
  sakura as ThemeDefinition,
  lavender as ThemeDefinition,
  midnight as ThemeDefinition,
  monoFocus as ThemeDefinition,
  medical as ThemeDefinition,
  law as ThemeDefinition,
  engineering as ThemeDefinition,
  tech as ThemeDefinition,
  teaching as ThemeDefinition,
  architecture as ThemeDefinition,
  science as ThemeDefinition,
  business as ThemeDefinition
];

export const THEMES_BY_ID: Record<string, ThemeDefinition> = ALL_THEMES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<string, ThemeDefinition>);

export const DEFAULT_THEME_ID = 'aurora';
