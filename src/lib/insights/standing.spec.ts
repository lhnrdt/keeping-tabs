import { describe, expect, it } from 'vitest';
import { owingSince, paidBack, positionOverTime } from './standing';

/** Paid by `paidBy`, split equally between Anna and Ben */
const expense = (date: string, amountCents: number, paidBy: string) => ({
	type: 'expense' as const,
	date,
	amountCents,
	paidBy,
	splits: [
		{ memberId: 'anna', shareCents: amountCents / 2 },
		{ memberId: 'ben', shareCents: amountCents / 2 }
	]
});
const payment = (date: string, amountCents: number, from: string, to: string) => ({
	type: 'payment' as const,
	date,
	amountCents,
	paidBy: from,
	splits: [{ memberId: to, shareCents: amountCents }]
});

const history = [
	expense('2026-09-01', 4000, 'anna'), // Anna +20
	expense('2026-09-03', 2000, 'ben'), // Anna +10
	expense('2026-09-03', 6000, 'ben'), // Anna -20
	payment('2026-09-10', 2000, 'anna', 'ben'), // Anna 0
	expense('2026-09-12', 1000, 'ben') // Anna -5
];

describe('positionOverTime', () => {
	it('is your balance at the end of each day', () => {
		expect(positionOverTime(history, 'anna')).toEqual([
			{ date: '2026-09-01', balance: 2000 },
			{ date: '2026-09-03', balance: -2000 },
			{ date: '2026-09-10', balance: 0 },
			{ date: '2026-09-12', balance: -500 }
		]);
	});
});

describe('owingSince', () => {
	it('counts from the start of the current run of owing', () => {
		expect(owingSince(history, 'anna')).toBe('2026-09-12');
		expect(owingSince(history.slice(0, 3), 'anna')).toBe('2026-09-03');
	});

	it('is nothing for someone who is owed', () => {
		expect(owingSince(history, 'ben')).toBeNull();
	});
});

describe('paidBack', () => {
	it('adds up the payments', () => {
		expect(paidBack(history)).toBe(2000);
	});
});
