import { describe, expect, it } from 'vitest';
import { parseSplitwise } from '#lib/import/splitwise.ts';
import { fromSplitwiseCategory } from '#lib/import/splitwise-categories.ts';
import { toSplitwiseCsv } from './splitwise';

const members = [
	{ id: 'a', name: 'Anna' },
	{ id: 'b', name: 'Ben' },
	{ id: 'c', name: '=Carl' }
];

// Newest first, like listExpenses
const entries = [
	{
		type: 'payment' as const,
		title: '',
		date: '2026-01-10',
		category: null,
		paidBy: 'b',
		amountCents: 1000,
		splits: [{ memberId: 'a', shareCents: 1000 }]
	},
	{
		type: 'expense' as const,
		title: 'Pizza, Wein',
		date: '2026-01-07',
		category: 'dining' as const,
		paidBy: 'a',
		amountCents: 3001,
		splits: [
			{ memberId: 'a', shareCents: 1001 },
			{ memberId: 'b', shareCents: 1000 },
			{ memberId: 'c', shareCents: 1000 }
		]
	},
	{
		type: 'expense' as const,
		title: 'Rewe',
		date: '2026-01-03',
		category: null,
		paidBy: 'c',
		amountCents: 4000,
		splits: [
			{ memberId: 'a', shareCents: 2000 },
			{ memberId: 'b', shareCents: 2000 }
		]
	}
];

describe('toSplitwiseCsv', () => {
	const csv = toSplitwiseCsv('EUR', members, entries);

	it('writes Splitwise columns, oldest first, with a closing total', () => {
		const lines = csv.replace('\uFEFF', '').trim().split('\r\n');
		expect(lines).toEqual([
			"Date,Description,Category,Cost,Currency,Anna,Ben,'=Carl",
			'2026-01-03,Rewe,,40.00,EUR,-20.00,-20.00,40.00',
			'2026-01-07,"Pizza, Wein",dining,30.01,EUR,20.00,-10.00,-10.00',
			'2026-01-10,Ben → Anna,Payment,10.00,EUR,-10.00,10.00,0.00',
			'2026-01-10,Total balance,,,EUR,-10.00,-20.00,30.00'
		]);
	});

	it('imports back as the same entries', () => {
		const parsed = parseSplitwise(csv, 'EUR');
		if (!parsed.ok) throw new Error(parsed.error);
		expect(parsed.value.people).toEqual(['Anna', 'Ben', '=Carl']);
		expect(parsed.value.skipped).toEqual([]);
		expect(
			parsed.value.rows.map((row) => [row.title, row.costCents, row.nets, row.isPayment])
		).toEqual([
			['Rewe', 4000, [-2000, -2000, 4000], false],
			['Pizza, Wein', 3001, [2000, -1000, -1000], false],
			['Ben → Anna', 1000, [-1000, 1000, 0], true]
		]);
		expect(parsed.value.rows.map((row) => fromSplitwiseCategory(row.category))).toEqual([
			null,
			'dining',
			null
		]);
	});
});
