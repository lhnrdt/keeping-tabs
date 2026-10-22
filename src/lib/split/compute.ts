// Turns a split mode and per-member inputs into each member's share of the amount.
// Shares always add up to the amount exactly (E-5, E-6).
import { splitEqual } from '#lib/money.ts';
import type { Result } from '#lib/validation.ts';
import type { SplitMode } from './modes';

/** A member's input in the mode's units (see inputs.ts); 0 when left empty */
export type SplitEntry = { memberId: string; input: number };
export type Share = { memberId: string; shareCents: number; input: number | null };

/** 100% in hundredths of a percent */
export const FULL_PERCENT = 10_000;

/**
 * Splits an amount in proportion to weights. Everyone gets the rounded-down share; the
 * remaining cents go to the largest remainders, ties in member order (largest remainder
 * method). BigInt keeps large amounts × weights exact.
 */
export function splitByWeight(amount: number, entries: readonly SplitEntry[]): Share[] {
	const total = BigInt(entries.reduce((sum, entry) => sum + entry.input, 0));
	const exact = entries.map((entry) => BigInt(amount) * BigInt(entry.input));
	const shares = exact.map((value) => Number(value / total));
	let left = amount - shares.reduce((sum, share) => sum + share, 0);
	const byRemainder = exact
		.map((value, i) => ({ i, remainder: value % total }))
		.sort((a, b) => (b.remainder > a.remainder ? 1 : b.remainder < a.remainder ? -1 : a.i - b.i));
	for (const { i } of byRemainder) {
		if (left-- <= 0) break;
		shares[i]++;
	}
	return entries.map((entry, i) => ({
		memberId: entry.memberId,
		shareCents: shares[i],
		input: entry.input
	}));
}

const sum = (entries: readonly SplitEntry[]) => entries.reduce((total, e) => total + e.input, 0);

/** Equal split, then each member's difference added (or taken) on top. */
function splitWithAdjustments(amount: number, entries: readonly SplitEntry[]): Result<Share[]> {
	const rest = amount - sum(entries);
	if (rest < 0) return { ok: false, error: 'split_adjust_too_large' };
	const base = splitEqual(
		rest,
		entries.map((entry) => entry.memberId)
	);
	const shares = entries.map((entry, i) => ({
		memberId: entry.memberId,
		shareCents: base[i].shareCents + entry.input,
		input: entry.input || null
	}));
	if (shares.some((share) => share.shareCents < 0)) {
		return { ok: false, error: 'split_adjust_too_large' };
	}
	return { ok: true, value: shares.filter((share) => share.shareCents > 0 || share.input) };
}

/**
 * entries: in member order. For equal, the chosen participants; for adjust, everyone;
 * otherwise everyone with their input (members with 0 don't take part).
 */
export function computeShares(
	mode: SplitMode,
	amount: number,
	entries: readonly SplitEntry[]
): Result<Share[]> {
	if (mode === 'adjust') return splitWithAdjustments(amount, entries);
	const taking = mode === 'equal' ? entries : entries.filter((entry) => entry.input > 0);
	if (taking.length === 0) return { ok: false, error: 'participants_required' };
	switch (mode) {
		case 'equal':
			return {
				ok: true,
				value: splitEqual(
					amount,
					taking.map((entry) => entry.memberId)
				).map((share) => ({ ...share, input: null }))
			};
		case 'exact':
			if (sum(taking) !== amount) return { ok: false, error: 'split_amounts_mismatch' };
			return {
				ok: true,
				value: taking.map((entry) => ({ ...entry, shareCents: entry.input }))
			};
		case 'percent':
			if (sum(taking) !== FULL_PERCENT) return { ok: false, error: 'split_percent_mismatch' };
			return { ok: true, value: splitByWeight(amount, taking) };
		case 'shares':
			return { ok: true, value: splitByWeight(amount, taking) };
	}
}

/** How much of the target the inputs cover so far, for the live remainder (SP-22). */
export function splitProgress(mode: SplitMode, amount: number, entries: readonly SplitEntry[]) {
	if (mode === 'exact') return { assigned: sum(entries), target: amount };
	if (mode === 'percent') return { assigned: sum(entries), target: FULL_PERCENT };
	return undefined;
}
