import { describe, expect, it } from 'vitest';
import type { ExpenseInput } from '#lib/validation.ts';
import { previewEntry } from './preview';

const input: ExpenseInput = {
	title: 'Bread',
	notes: null,
	original: null,
	amountCents: 420,
	odometerM: null,
	fuelMl: null,
	date: '2026-11-15',
	paidBy: 'anna',
	payers: null,
	category: 'groceries',
	sealedDetails: null,
	splitMode: 'equal',
	shares: [
		{ memberId: 'anna', shareCents: 210, input: 0 },
		{ memberId: 'ben', shareCents: 210, input: 0 }
	],
	items: null
};

describe('previewEntry', () => {
	it('is the row as the list shows it, with your side', () => {
		const row = previewEntry('id-1', input, 'anna');
		expect(row).toMatchObject({ id: 'id-1', type: 'expense', title: 'Bread', amountCents: 420 });
		expect(row.yourSide).toBe(210);
		expect(previewEntry('id-1', input, 'ben').yourSide).toBe(-210);
		expect(previewEntry('id-1', input, null).yourSide).toBeNull();
	});
});
