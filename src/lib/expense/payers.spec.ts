import { describe, expect, it } from 'vitest';
import { balances } from '#lib/money.ts';
import { directTransfers } from '#lib/settle.ts';
import { yourSide } from './your-side';
import { owedTo } from './owed-to';
import { mainPayer, paidByMember, payersOf } from './payers';

// Dinner for 90: Anna paid 60, Ben 30, split equally between Anna, Ben and Cara
const dinner = {
	paidBy: 'anna',
	amountCents: 9000,
	payers: [
		{ memberId: 'anna', amountCents: 6000 },
		{ memberId: 'ben', amountCents: 3000 }
	],
	splits: ['anna', 'ben', 'cara'].map((memberId) => ({ memberId, shareCents: 3000 }))
};

describe('several payers (#39)', () => {
	it('one payer paid it all', () => {
		expect(payersOf({ paidBy: 'anna', amountCents: 500 })).toEqual([
			{ memberId: 'anna', amountCents: 500 }
		]);
	});

	it('counts what each paid in the balances', () => {
		expect(Object.fromEntries(balances(['anna', 'ben', 'cara'], [dinner]))).toEqual({
			anna: 3000,
			ben: 0,
			cara: -3000
		});
	});

	it('owes a share to the payers in proportion, to the cent', () => {
		expect(owedTo(dinner, 3000)).toEqual([
			{ memberId: 'anna', amountCents: 2000 },
			{ memberId: 'ben', amountCents: 1000 }
		]);
		expect(owedTo(dinner, 1000).reduce((sum, part) => sum + part.amountCents, 0)).toBe(1000);
	});

	it('settles directly with each payer', () => {
		// Cara owes Anna 20 and Ben 10; Ben owes Anna 20 for his share, Anna owes Ben 10
		expect(directTransfers(['anna', 'ben', 'cara'], [dinner])).toEqual([
			{ from: 'ben', to: 'anna', amountCents: 1000 },
			{ from: 'cara', to: 'anna', amountCents: 2000 },
			{ from: 'cara', to: 'ben', amountCents: 1000 }
		]);
	});

	it('shows your side from what you paid', () => {
		expect(yourSide(dinner, 'ben', 3000)).toBe(0);
		expect(yourSide(dinner, 'anna', 3000)).toBe(3000);
		expect(paidByMember(dinner, 'cara')).toBe(0);
		expect(mainPayer(dinner)).toBe('anna');
	});
});
