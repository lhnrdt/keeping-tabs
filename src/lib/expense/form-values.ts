// An expense or payment form's values, the same on the server and, for an encrypted group, in the
// browser, which is the only place that can check those (#110).
import { readSplitInputs } from '#lib/split/form.ts';

const text = (form: FormData, key: string) => String(form.get(key) ?? '');

/** What each member paid, from fields named paid.<member id> (#39) */
const readPayers = (form: FormData) =>
	Object.fromEntries(
		[...form.keys()]
			.filter((key) => key.startsWith('paid.'))
			.map((key) => [key.slice('paid.'.length), text(form, key)])
	);

export const expenseValues = (form: FormData, rate: string) => ({
	title: text(form, 'title'),
	notes: text(form, 'notes'),
	amount: text(form, 'amount'),
	currency: text(form, 'currency'),
	rate,
	odometer: text(form, 'odometer'),
	litres: text(form, 'litres'),
	units: text(form, 'units'),
	date: text(form, 'date'),
	paidBy: text(form, 'paidBy'),
	payers: readPayers(form),
	participants: form.getAll('participants').map(String),
	category: text(form, 'category'),
	splitMode: text(form, 'splitMode'),
	inputs: readSplitInputs(form),
	items: text(form, 'items')
});

export const paymentValues = (form: FormData) => ({
	from: text(form, 'from'),
	to: text(form, 'to'),
	amount: text(form, 'amount'),
	date: text(form, 'date')
});
