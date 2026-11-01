import { error, fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { undoUrl } from '#lib/group/tabs.ts';
import { m } from '#lib/paraglide/messages.js';
import { addComment, deleteComment, listComments } from '#lib/server/comments.ts';
import { formContext } from '#lib/server/context.ts';
import { readExpenseForm, rememberDefaultSplit } from '#lib/server/group-forms.ts';
import {
	findExpense,
	listChosenCategories,
	isEntryOf,
	softDeleteEntry,
	updateExpense
} from '#lib/server/expenses.ts';
import { clientIdIn, parseComment } from '#lib/validation.ts';
import { isJpeg, MAX_RECEIPT_BYTES } from '#lib/expense/receipt-image.ts';
import { addReceipt, deleteReceipt, listReceipts } from '#lib/server/receipts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { group } = await parent();
	const [expense, chosen, comments, receipts] = await Promise.all([
		findExpense(locals.db, group.id, params.id),
		listChosenCategories(locals.db, group.id),
		listComments(locals.db, params.id),
		listReceipts(locals.db, params.id)
	]);
	if (expense?.type !== 'expense') error(404, m.error_expense_not_found());
	return { expense, chosen, comments, receipts };
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const result = await readExpenseForm(locals.db, group, form);
		if (!result.ok) return result.failure;
		if (!(await updateExpense(locals.db, group.id, actorId, params.id, result.input))) {
			error(404, m.error_expense_not_found());
		}
		await rememberDefaultSplit(locals.db, group.id, actorId, form, result.input);
		redirect(303, resolve('/g/[token]', { token: params.token }));
	},

	delete: async ({ locals, params, request }) => {
		const { group, actorId } = await formContext(locals, params.token, request);
		await softDeleteEntry(locals.db, group.id, actorId, params.id, 'expense.delete');
		redirect(303, undoUrl(resolve('/g/[token]', { token: params.token }), 'expenses', params.id));
	},

	comment: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		if (!(await isEntryOf(locals.db, group.id, params.id, 'expense'))) {
			error(404, m.error_expense_not_found());
		}
		const body = parseComment(form.get('comment'));
		if (!body.ok) {
			return fail(400, { commentError: body.error, comment: String(form.get('comment') ?? '') });
		}
		await addComment(locals.db, group.id, actorId, params.id, body.value, clientIdIn(form));
		return { commented: true };
	},

	uncomment: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		await deleteComment(locals.db, group.id, actorId, params.id, String(form.get('commentId')));
	},

	addReceipt: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		if (!(await isEntryOf(locals.db, group.id, params.id, 'expense'))) {
			error(404, m.error_expense_not_found());
		}
		const photo = form.get('photo');
		// Sealing adds a little, and hides what it is: only the browser could tell it's a JPEG (#110)
		const limit = MAX_RECEIPT_BYTES + (group.keyId ? 64 : 0);
		if (!(photo instanceof File) || photo.size === 0 || photo.size > limit) {
			return fail(400, { receiptError: 'receipt_invalid' as const });
		}
		const bytes = new Uint8Array(await photo.arrayBuffer());
		// In an encrypted group a readable JPEG is one that wasn't sealed
		if (Boolean(group.keyId) === isJpeg(bytes))
			return fail(400, { receiptError: 'receipt_invalid' as const });
		const refused = await addReceipt(locals.db, group.id, actorId, params.id, bytes);
		if (refused) return fail(400, { receiptError: refused });
	},

	removeReceipt: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		await deleteReceipt(locals.db, group.id, actorId, params.id, String(form.get('receiptId')));
	}
};
