// A group's default split (#41): new expenses start split this way, e.g. 60/40 or 2:1 for a
// couple. Only percentages and parts carry over to any amount, so only those can be one.
import type { Share } from './compute';
import { formatSplitInput } from './inputs';
import type { SplitMode } from './modes';

export const DEFAULT_MODES = ['percent', 'shares'] as const satisfies readonly SplitMode[];
export type DefaultMode = (typeof DEFAULT_MODES)[number];

/** Each member's input (hundredths of a percent or of a part), by member id */
export type DefaultSplit = { mode: DefaultMode; inputs: Record<string, number> };

export const canBeDefault = (mode: SplitMode): mode is DefaultMode =>
	(DEFAULT_MODES as readonly SplitMode[]).includes(mode);

/** From a saved split: what to remember, if its mode can be a default */
export function defaultFrom(mode: SplitMode, shares: readonly Share[]): DefaultSplit | null {
	if (!canBeDefault(mode)) return null;
	return {
		mode,
		inputs: Object.fromEntries(
			shares.filter((share) => share.input !== null).map((share) => [share.memberId, share.input!])
		)
	};
}

/** As stored with a group; anything unreadable counts as none */
export function parseDefaultSplit(value: unknown): DefaultSplit | null {
	if (!value || typeof value !== 'object') return null;
	const { mode, inputs } = value as { mode?: unknown; inputs?: unknown };
	if (typeof mode !== 'string' || !canBeDefault(mode as SplitMode)) return null;
	if (!inputs || typeof inputs !== 'object') return null;
	const entries = Object.entries(inputs).filter(
		(entry): entry is [string, number] => Number.isInteger(entry[1]) && entry[1] >= 0
	);
	return { mode: mode as DefaultMode, inputs: Object.fromEntries(entries) };
}

/** A new expense's split fields, for the members still in the group */
export function defaultFormValues(
	split: DefaultSplit,
	memberIds: readonly string[],
	currency: string
) {
	return {
		splitMode: split.mode,
		inputs: Object.fromEntries(
			memberIds.map((id) => [id, formatSplitInput(split.mode, split.inputs[id] ?? 0, currency)])
		)
	};
}
