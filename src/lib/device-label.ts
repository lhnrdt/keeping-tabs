// A short, readable name for a browser, e.g. "Chrome on Android" (#126). Only this label is
// kept, never the whole user agent.

const BROWSERS: [RegExp, string][] = [
	[/SamsungBrowser\//, 'Samsung Internet'],
	[/Edg(A|iOS)?\//, 'Edge'],
	[/Firefox\/|FxiOS\//, 'Firefox'],
	[/OPR\/|Opera/, 'Opera'],
	[/Chrome\/|CriOS\//, 'Chrome'],
	[/Safari\//, 'Safari']
];

const SYSTEMS: [RegExp, string][] = [
	[/iPhone/, 'iPhone'],
	[/iPad/, 'iPad'],
	[/Android/, 'Android'],
	[/Mac OS X|Macintosh/, 'Mac'],
	[/Windows/, 'Windows'],
	[/CrOS/, 'ChromeOS'],
	[/Linux/, 'Linux']
];

const first = (list: [RegExp, string][], text: string) =>
	list.find(([pattern]) => pattern.test(text))?.[1];

/** null when nothing is recognized */
export function deviceLabel(userAgent: string | null): string | null {
	if (!userAgent) return null;
	const browser = first(BROWSERS, userAgent);
	const system = first(SYSTEMS, userAgent);
	if (browser && system) return `${browser} · ${system}`;
	return browser ?? system ?? null;
}
