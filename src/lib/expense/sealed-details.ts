// What an encrypted group's entry keeps sealed besides its text (#110): everything about the money.
// The row itself only says it exists, of which type and on which date. The browser opens this into
// the row's usual fields (crypto/open-data.ts), so everything after that works as for any entry.
import type { ExpenseInput, PaymentInput } from '#lib/validation.ts';

/** What a sealed row's amount column holds: the database wants one above zero, and it says nothing */
export const SEALED_AMOUNT = 1;

export const DETAIL_FIELDS = [
	'amountCents',
	'paidBy',
	'splitMode',
	'items',
	'splits',
	'payers',
	'originalCurrency',
	'originalAmountCents',
	'exchangeRate',
	'category',
	'autoCategory',
	'odometerM',
	'fuelMl'
] as const;

/** A group's plan and default split, sealed the same way */
export const GROUP_DETAIL_FIELDS = ['budgetCents', 'endsOn', 'defaultSplit'] as const;

export const detailsFromInput = (
	input: Omit<ExpenseInput, 'sealedDetails'>,
	autoCategory: string | null
) => ({
	amountCents: input.amountCents,
	paidBy: input.paidBy,
	splitMode: input.splitMode,
	items: input.items,
	splits: input.shares,
	payers: input.payers,
	originalCurrency: input.original?.currency ?? null,
	originalAmountCents: input.original?.amountCents ?? null,
	exchangeRate: input.original?.rate ?? null,
	category: input.category,
	autoCategory,
	odometerM: input.odometerM,
	fuelMl: input.fuelMl
});

export const detailsFromPayment = (input: Omit<PaymentInput, 'date'>) => ({
	amountCents: input.amountCents,
	paidBy: input.from,
	splitMode: 'exact',
	splits: [{ memberId: input.to, shareCents: input.amountCents, input: input.amountCents }]
});

/** The form of a sealed expense for the database: the money stays out of it */
export const sealedInput = (fields: {
	title: string;
	notes: string | null;
	date: string;
	paidBy: string;
	sealedDetails: string;
}): ExpenseInput => ({
	...fields,
	original: null,
	amountCents: SEALED_AMOUNT,
	odometerM: null,
	fuelMl: null,
	payers: null,
	category: null,
	splitMode: 'equal',
	shares: [],
	items: null
});
