// The split for new expenses as set on its own page (#306): equal, or percentages or parts,
// checked like an expense's split. They carry over to any amount, so any amount checks them.
import { parseSplit, type Result } from '#lib/validation.ts';
import { canBeDefault, defaultFrom, type DefaultSplit } from './default-split';
import type { SplitMode } from './modes';

const ANY_AMOUNT = 10_000;

export function parseDefaultSplitForm(
	values: { splitMode: unknown; inputs: Record<string, unknown> },
	group: { memberIds: readonly string[]; currency: string }
): Result<DefaultSplit | null> {
	const mode = String(values.splitMode ?? '');
	if (mode === 'equal') return { ok: true, value: null };
	if (!canBeDefault(mode as SplitMode)) return { ok: false, error: 'split_mode_invalid' };
	const parsed = parseSplit(
		{ splitMode: mode, participants: [], inputs: values.inputs },
		ANY_AMOUNT,
		group
	);
	if (!parsed.ok) return parsed;
	return { ok: true, value: defaultFrom(parsed.value.splitMode, parsed.value.shares) };
}
