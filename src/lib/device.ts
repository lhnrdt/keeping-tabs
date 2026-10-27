// Per-device memory of opened groups (A-6). Storage can be unavailable (private mode, blocked
// site data), so every access is guarded and the app works without it.

import type { GroupLink } from './group/your-groups';

export type RecentGroup = GroupLink & { openedAt: number };

const RECENT_KEY = 'keeping-tabs:groups';

function read<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw === null ? fallback : (JSON.parse(raw) as T);
	} catch {
		return fallback;
	}
}

function write(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Not remembered on this device; nothing else to do
	}
}

/** Groups opened on this device, most recent first. */
export const getRecentGroups = () =>
	read<RecentGroup[]>(RECENT_KEY, []).sort((a, b) => b.openedAt - a.openedAt);

/** Adds or refreshes a group, keyed by id so a regenerated link replaces the old one. */
export function rememberGroup(group: Omit<RecentGroup, 'openedAt'>) {
	const others = getRecentGroups().filter((g) => g.id !== group.id);
	write(RECENT_KEY, [{ ...group, openedAt: Date.now() }, ...others]);
}

/** Keeps only the remembered groups in `current` (by id), with their current name and look */
export function keepRecentGroups(current: readonly GroupLink[]) {
	const byId = new Map(current.map((group) => [group.id, group]));
	const kept = getRecentGroups().flatMap((group) => {
		const now = byId.get(group.id);
		return now ? [{ ...now, openedAt: group.openedAt }] : [];
	});
	write(RECENT_KEY, kept);
	return kept;
}

/** Forgets one group remembered on this device (e.g. after deleting it). */
export function forgetGroup(id: string) {
	write(
		RECENT_KEY,
		getRecentGroups().filter((group) => group.id !== id)
	);
}

/** Forgets the groups remembered on this device (e.g. after deleting the identity). */
export function clearRecentGroups() {
	try {
		localStorage.removeItem(RECENT_KEY);
	} catch {
		// Nothing was remembered, or storage is unavailable
	}
}

const SEEN_CHANGELOG_KEY = 'keeping-tabs:seen-changelog';

/** The newest version read about in What's new on this device (#212) */
export const getSeenChangelog = () => read<string | null>(SEEN_CHANGELOG_KEY, null);
export const setSeenChangelog = (version: string) => write(SEEN_CHANGELOG_KEY, version);
