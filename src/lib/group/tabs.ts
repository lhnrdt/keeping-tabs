export const GROUP_TABS = ['expenses', 'balances', 'group'] as const;

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
