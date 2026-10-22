import { describe, expect, it } from 'vitest';
import { planRow } from './plan';
import { parseSplitwise } from './splitwise';

// Shaped like a real German export
const GERMAN = `Datum,Beschreibung,Kategorie,Kosten,Währung,Johannes,Elisabeth Hecht

2022-05-05,Auto-Fahrt,Auto,40.00,EUR,20.00,-20.00
2022-05-05,Bahnticket,Allgemein,48.80,EUR,-24.40,24.40
2022-06-01,Elisabeth H. zahlte Johannes,Zahlung,10.00,EUR,-10.00,10.00
2022-06-02,"Pizza, Wein",Restaurant,30.00,EUR,10.00,-10.00
2022-06-02,"Pizza, Wein",Restaurant,30.00,EUR,10.00,-10.00
2022-06-03,London,Allgemein,20.00,GBP,10.00,-10.00

2026-10-22,Gesamtbilanz, , ,EUR,35.60,-35.60
`;

describe('parseSplitwise', () => {
	const result = parseSplitwise(GERMAN, 'EUR');
	if (!result.ok) throw new Error(result.error);
	const { people, rows, skipped } = result.value;

	it('reads the people, rows and payments, skipping the total row', () => {
		expect(people).toEqual(['Johannes', 'Elisabeth Hecht']);
		expect(rows.map((row) => row.title)).toEqual([
			'Auto-Fahrt',
			'Bahnticket',
			'Elisabeth H. zahlte Johannes',
			'Pizza, Wein',
			'Pizza, Wein'
		]);
		expect(rows[2].isPayment).toBe(true);
		expect(rows[0]).toMatchObject({ date: '2022-05-05', costCents: 4000, nets: [2000, -2000] });
	});

	it('skips other currencies', () => {
		expect(skipped).toEqual([{ line: 8, reason: 'currency' }]);
	});

	it('gives identical rows different keys, the same on every import', () => {
		expect(rows[3].key).not.toBe(rows[4].key);
		const again = parseSplitwise(GERMAN, 'EUR');
		expect(again.ok && again.value.rows.map((row) => row.key)).toEqual(rows.map((row) => row.key));
	});

	it('rejects files that are not a Splitwise export', () => {
		expect(parseSplitwise('Name,Amount\nx,1', 'EUR')).toEqual({
			ok: false,
			error: 'import_not_splitwise'
		});
	});
});

describe('planRow', () => {
	const row = (nets: number[], extra: object = {}) => ({
		line: 2,
		date: '2022-05-05',
		title: 'Dinner',
		category: 'Restaurant',
		costCents: 3000,
		nets,
		isPayment: false,
		key: 'k',
		...extra
	});

	it('rebuilds an expense with one payer exactly', () => {
		expect(planRow(row([2000, -1000, -1000]))).toEqual([
			{
				type: 'expense',
				title: 'Dinner',
				date: '2022-05-05',
				amountCents: 3000,
				paidBy: 0,
				shares: [
					{ person: 0, shareCents: 1000 },
					{ person: 1, shareCents: 1000 },
					{ person: 2, shareCents: 1000 }
				],
				category: 'dining',
				key: 'k'
			}
		]);
	});

	it('turns Splitwise payments into payments', () => {
		const [payment] = planRow(row([-1000, 1000], { isPayment: true, costCents: 1000 }));
		expect(payment).toMatchObject({
			type: 'payment',
			paidBy: 1,
			amountCents: 1000,
			shares: [{ person: 0, shareCents: 1000 }]
		});
	});

	it('splits a row with several payers into one expense each, keeping balances', () => {
		const entries = planRow(row([1000, 500, -1500]));
		expect(entries.map((e) => [e.paidBy, e.amountCents, e.shares])).toEqual([
			[0, 1000, [{ person: 2, shareCents: 1000 }]],
			[1, 500, [{ person: 2, shareCents: 500 }]]
		]);
	});
});
