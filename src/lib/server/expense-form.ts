import { fail } from '@sveltejs/kit';
import { listMembers } from './groups';
import { parseExpense } from '#lib/validation.ts';
import type { Db } from './db';

/** Reads and validates the expense form; on failure returns the values to re-fill it. */
export async function readExpenseForm(
	db: Db,
	group: { id: string; currency: string },
	form: FormData
) {
	const values = {
		title: String(form.get('title') ?? ''),
		amount: String(form.get('amount') ?? ''),
		date: String(form.get('date') ?? ''),
		paidBy: String(form.get('paidBy') ?? ''),
		participants: form.getAll('participants').map(String)
	};
	const members = await listMembers(db, group.id);
	const result = parseExpense(values, {
		memberIds: members.map((member) => member.id),
		currency: group.currency
	});
	return result.ok
		? { ok: true as const, input: result.value }
		: { ok: false as const, failure: fail(400, { error: result.error, values }) };
}
