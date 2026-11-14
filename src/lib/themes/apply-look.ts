// Shows a look in this page right away (#60, #332, #330): the colours' theme, or a theme of your
// own over it. The page's first paint has it from the server already.
import type { Look } from './look';
import { ownThemeProperties } from './own-theme';

export function applyLook({ colors, own }: Pick<Look, 'colors' | 'own'>) {
	window.applyAccent?.(colors, own ? ownThemeProperties(own) : null);
}
