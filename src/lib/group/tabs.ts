export const GROUP_TABS = ['expenses', 'balances', 'insights', 'group'] as const;

export type GroupTab = (typeof GROUP_TABS)[number];

/** The tab in `?tab=`, defaulting to expenses. */
export function currentTab(url: { searchParams: { get(name: string): string | null } }): GroupTab {
	const tab = url.searchParams.get('tab');
	return GROUP_TABS.find((candidate) => candidate === tab) ?? 'expenses';
}

/** Form action URL that keeps the tab, so a non-JS submit returns to the same tab. */
export const tabAction = (action: string, tab: GroupTab) => `?/${action}&tab=${tab}`;

/** Path to a tab of a group, e.g. for redirects after saving. */
export const groupTabUrl = (groupPath: string, tab: GroupTab) => `${groupPath}?tab=${tab}`;

/** Query parameter naming an entry that was just deleted, so the group offers "Undo" (#78) */
export const UNDO_PARAM = 'deleted';

/** A group tab after deleting an entry: shows "Undo" for it */
export const undoUrl = (groupPath: string, tab: GroupTab, entryId: string) =>
	`${groupTabUrl(groupPath, tab)}&${UNDO_PARAM}=${encodeURIComponent(entryId)}`;
