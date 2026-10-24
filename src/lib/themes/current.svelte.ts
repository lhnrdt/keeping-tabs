// The nature theme in use (#60), for its illustrations: from the layout's data (the cookie,
// so pages render with it), and changed at once by the theme picker.
import { getContext, setContext } from 'svelte';
import { DEFAULT_THEME, type ThemeId } from './palettes';

export class ThemeChoice {
	id = $state<ThemeId>(DEFAULT_THEME);

	constructor(id: ThemeId) {
		this.id = id;
	}
}

const KEY = Symbol('theme');

export const provideTheme = (choice: ThemeChoice) => setContext(KEY, choice);

/** Outside the app's layout (e.g. in tests) the default theme */
export const useTheme = () =>
	getContext<ThemeChoice | undefined>(KEY) ?? new ThemeChoice(DEFAULT_THEME);
