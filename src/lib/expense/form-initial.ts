// What the expense form starts from for something already saved: as it was typed.
import { fuelInputValue, odometerInputValue } from '#lib/expense/driving.ts';
import { amountInputValue } from '#lib/money.ts';
import type { Units } from '#lib/settings.ts';
import { splitInputValues } from '#lib/split/inputs.ts';
import { ITEMS_MODE } from '#lib/split/items.ts';
import { SEVERAL_PAYERS } from '#lib/validation.ts';

type Saved = Parameters<typeof splitInputValues>[0] & {
	title: string;
	notes: string | null;
	amountCents: number;
	originalCurrency: string | null;
	originalAmountCents: number | null;
	exchangeRate: string | null;
	odometerM: number | null;
	fuelMl: number | null;
	date: string;
	paidBy: string;
	payers: readonly { memberId: string; amountCents: number }[] | null;
	category: string | null;
	items: readonly { name: string; cents: number; memberIds: string[] }[] | null;
	splitMode: string;
	splits: readonly { memberId: string }[];
};

export const expenseFormValues = (expense: Saved, currency: string, units: Units) => ({
	title: expense.title,
	notes: expense.notes ?? '',
	// Typed in another currency (#54): as typed, with its rate
	amount: expense.originalCurrency
		? amountInputValue(expense.originalAmountCents ?? 0, expense.originalCurrency)
		: amountInputValue(expense.amountCents, currency),
	currency: expense.originalCurrency ?? '',
	rate: expense.exchangeRate ?? '',
	odometer: odometerInputValue(expense.odometerM, units),
	litres: fuelInputValue(expense.fuelMl, units),
	date: expense.date,
	// Several payers (#39): each with what they paid
	paidBy: expense.payers ? SEVERAL_PAYERS : expense.paidBy,
	payers: Object.fromEntries(
		(expense.payers ?? []).map((payer) => [
			payer.memberId,
			amountInputValue(payer.amountCents, currency)
		])
	),
	participants: expense.splits.map((split) => split.memberId),
	category: expense.category ?? '',
	// Split by receipt items (#53): as typed, in the amount's currency
	splitMode: expense.items ? ITEMS_MODE : expense.splitMode,
	items: JSON.stringify(
		(expense.items ?? []).map(({ name, cents, memberIds }) => ({
			name,
			price: amountInputValue(cents, expense.originalCurrency ?? currency),
			memberIds
		}))
	),
	inputs: splitInputValues(expense, currency)
});
