// A new expense as the list shows it, made on the device from what was typed (#347), so it sits
// in its place in the list right away while it goes out to the server.
import { yourSide } from '#lib/expense/your-side.ts';
import type { ListEntry } from '#lib/server/expense-entries.ts';
import type { ExpenseInput } from '#lib/validation.ts';

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
