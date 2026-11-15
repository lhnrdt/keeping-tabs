// An expense or payment as the list shows it, made on the device from what was typed (#347), so
// it sits in its place in the list right away while it goes out to the server.
import { yourSide } from '#lib/expense/your-side.ts';
import type { ListEntry } from '#lib/server/expense-entries.ts';
import type { ExpenseInput, PaymentInput } from '#lib/validation.ts';

/** The row for it, with `id` as it will have on the server; `me` for your side of it */
export function previewEntry(id: string, input: ExpenseInput, me: string | null): ListEntry {
	const myShare = input.shares.find((share) => share.memberId === me)?.shareCents ?? 0;
	return {
		id,
		type: 'expense',
		title: input.title,
		notes: input.notes,
		originalCurrency: input.original?.currency ?? null,
		originalAmountCents: input.original?.amountCents ?? null,
		exchangeRate: input.original?.rate ?? null,
		odometerM: input.odometerM,
		fuelMl: input.fuelMl,
		amountCents: input.amountCents,
		paidBy: input.paidBy,
		date: input.date,
		category: input.category,
		sealedDetails: null,
		comments: 0,
		receipts: 0,
		recipient: undefined,
		payers: input.payers,
		yourSide: yourSide(input, me, myShare)
	};
}

/** A payment's row ("Ben paid Anna"), with `id` as it will have on the server */
export function previewPayment(id: string, input: PaymentInput): ListEntry {
	return {
		...previewEntry(
			id,
			{
				title: '',
				notes: null,
				original: null,
				amountCents: input.amountCents,
				odometerM: null,
				fuelMl: null,
				date: input.date,
				paidBy: input.from,
				payers: null,
				category: null,
				sealedDetails: null,
				splitMode: 'exact',
				shares: [],
				items: null
			},
			null
		),
		type: 'payment',
		recipient: input.to
	};
}
