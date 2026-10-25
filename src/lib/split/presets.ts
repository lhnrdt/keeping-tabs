// Quick choices for two people (#40): who paid, and whether it's split equally or the other
// one owes all of it. Anything else is "more options", the full form.

export const PRESETS = ['iSplit', 'iFull', 'theySplit', 'theyFull'] as const;
export type Preset = (typeof PRESETS)[number];

type Pair = { me: string; other: string };

/** The payer and who takes part (split equally between them) */
export function presetValues(preset: Preset, { me, other }: Pair) {
	switch (preset) {
		case 'iSplit':
			return { paidBy: me, participants: [me, other] };
		case 'iFull':
			return { paidBy: me, participants: [other] };
		case 'theySplit':
			return { paidBy: other, participants: [me, other] };
		case 'theyFull':
			return { paidBy: other, participants: [me] };
	}
}

/** Which quick choice an expense is, if any; a new one (no payer yet) is "I paid, split" */
export function presetOf(
	values: { paidBy: string; participants: readonly string[]; splitMode: string },
	pair: Pair
): Preset | null {
	if (values.splitMode && values.splitMode !== 'equal') return null;
	const paidBy = values.paidBy || pair.me;
	const same = (a: readonly string[], b: readonly string[]) =>
		a.length === b.length && a.every((id) => b.includes(id));
	return (
		PRESETS.find((preset) => {
			const expected = presetValues(preset, pair);
			return expected.paidBy === paidBy && same(expected.participants, values.participants);
		}) ?? null
	);
}
