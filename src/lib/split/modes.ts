// How an expense is split between members (E-3).

export const SPLIT_MODES = ['equal', 'exact', 'percent', 'shares', 'adjust'] as const;

/**
 * equal: chosen participants pay the same; exact: amounts per person; percent: percentages
 * per person; shares: parts per person (2:1); adjust: equal, plus or minus an amount each.
 */
export type SplitMode = (typeof SPLIT_MODES)[number];

export const isSplitMode = (value: unknown): value is SplitMode =>
	SPLIT_MODES.includes(value as SplitMode);
