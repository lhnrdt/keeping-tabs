// Release versioning rules. Versions are semantic (MAJOR.MINOR.PATCH); git tags
// (v1.2.3) on master are the only record of releases. Each feature PR's title
// decides how much the next release bumps the version:
//   feat:            → minor
//   fix:, perf:, …   → patch
//   type!: (breaking) → major, but only minor while MAJOR is 0 (before 1.0)

export type Bump = 'major' | 'minor' | 'patch';

const TYPES = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'build', 'ci', 'chore', 'revert'];

const TITLE = new RegExp(`^(?<type>${TYPES.join('|')})(?:\\([a-z0-9-]+\\))?(?<breaking>!)?: \\S`);

const RANK: Record<Bump, number> = { patch: 0, minor: 1, major: 2 };

/** PR titles must look like "feat: Add expenses" or "fix(balances)!: …". */
export const isValidPrTitle = (title: string) => TITLE.test(title);

export function bumpFor(title: string): Bump {
	const match = TITLE.exec(title);
	if (match?.groups?.breaking) return 'major';
	return match?.groups?.type === 'feat' ? 'minor' : 'patch';
}

export function parseVersion(version: string): [number, number, number] {
	const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version);
	if (!match) throw new Error(`Not a release version: ${version}`);
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** The next release after `current`, given the titles of the PRs merged since. */
export function nextVersion(current: string, prTitles: readonly string[]): string | null {
	if (prTitles.length === 0) return null;
	let bump = prTitles.map(bumpFor).reduce((a, b) => (RANK[b] > RANK[a] ? b : a));
	const [major, minor, patch] = parseVersion(current);
	if (major === 0 && bump === 'major') bump = 'minor';
	if (bump === 'major') return `${major + 1}.0.0`;
	if (bump === 'minor') return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

/** Staging builds: the upcoming release plus how many PRs it contains so far. */
export function releaseCandidate(current: string, prTitles: readonly string[]): string | null {
	const next = nextVersion(current, prTitles);
	return next && `${next}-rc.${prTitles.length}`;
}

/** Highest release tag (ignores anything that isn't vMAJOR.MINOR.PATCH). */
export function latestRelease(tags: readonly string[]): string {
	const releases = tags.filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag)).map(parseVersion);
	releases.sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2]);
	return releases[0]?.join('.') ?? '0.0.0';
}
