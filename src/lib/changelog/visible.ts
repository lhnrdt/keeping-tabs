// Which versions of the changelog to show (#212): those up to the app's own. A test build of
// the coming version (0.14.0-rc.2) already shows its lines, so they can be checked.
import type { ChangelogEntry } from './entries';

const parts = (version: string) =>
	version
		.split('-')[0]
		.split('.')
		.map((part) => Number(part) || 0);

/** -1, 0 or 1, by major, minor and patch; pre-releases count as their version */
export function compareVersions(a: string, b: string) {
	const [x, y] = [parts(a), parts(b)];
	for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
	return 0;
}

/** A development build (0.0.0-dev) shows everything */
const isDevelopment = (version: string) => compareVersions(version, '0.0.0') === 0;

export const visibleEntries = (entries: readonly ChangelogEntry[], appVersion: string) =>
	isDevelopment(appVersion)
		? [...entries]
		: entries.filter((entry) => compareVersions(entry.version, appVersion) <= 0);
