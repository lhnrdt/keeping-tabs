// Forms of a group with encrypted text (#110): named fields are sealed in the browser, just
// before sending, so the server only ever sees them sealed. If the server sends them back with
// a refusal, they're opened again for the form.
import { applyAction, type SubmitFunction } from '$app/forms';
import { page } from '$app/state';
import { m } from '#lib/paraglide/messages.js';
import { expenseValues, paymentValues } from '#lib/expense/form-values.ts';
import {
	detailsFromInput,
	detailsFromPayment,
	GROUP_DETAIL_FIELDS
} from '#lib/expense/sealed-details.ts';
import type { GroupKind } from '#lib/group/kinds.ts';
import { choiceToStore, isSection } from '#lib/insights/sections.ts';
import { parseAmount } from '#lib/money.ts';
import { defaultFrom } from '#lib/split/default-split.ts';
import {
	normalizeText,
	parseDate,
	parseExpense,
	parseKind,
	parsePayment,
	parseTint
} from '#lib/validation.ts';
import { keyFor } from './keyring';
import { openDeep } from './open-data';
import { sealText, textContext } from './seal';

/** Receipt items are JSON: only their names are text to seal */
async function sealItems(key: string, json: string, row: string) {
	const items = JSON.parse(json) as { name: string }[];
	return JSON.stringify(
		await Promise.all(
			items.map(async (item) => ({
				...item,
				name: item.name.trim()
					? await sealText(key, item.name, textContext('item', row))
					: item.name
			}))
		)
	);
}

/** What a field is called once sealed, where the form calls it something else */
const SEALED_AS: Record<string, string> = { comment: 'body' };

/**
 * Seals these fields in place; empty ones stay empty, so "required" still means something. `row`
 * binds them to the row they're for. What repeats goes on many rows, so it's bound to none.
 */
export async function sealFields(form: FormData, key: string, names: readonly string[], row = '') {
	const bindTo = form.get('repeats') ? '' : row;
	for (const name of names) {
		const values = form.getAll(name);
		if (values.length === 0) continue;
		form.delete(name);
		for (const value of values) {
			const text = String(value);
			if (!text.trim()) form.append(name, text);
			else if (name === 'items') form.append(name, await sealItems(key, text, bindTo));
			else
				form.append(name, await sealText(key, text, textContext(SEALED_AS[name] ?? name, bindTo)));
		}
	}
}

const groupMemberIds = () =>
	((page.data.members ?? []) as { id: string }[]).map((member) => member.id);
const groupCurrency = () => String(page.data.group?.currency ?? '');

/** A group's settings, with these changes */
async function sealGroupDetails(key: string, changes: Record<string, unknown>) {
	const group: Record<string, unknown> = page.data.group ?? {};
	const current = Object.fromEntries(
		GROUP_DETAIL_FIELDS.map((name) => [name, group[name] ?? null])
	);
	return sealText(key, JSON.stringify({ ...current, ...changes }), textContext('details'));
}

type Refusal = { error: string; values?: unknown };

const leaveOnly = (form: FormData, kept: readonly string[]) => {
	for (const name of new Set(form.keys())) if (!kept.includes(name)) form.delete(name);
};

/**
 * An expense: checked here, since the server can't, and everything about its money sealed in
 * `details`. What's left goes through sealFields. Returns why it can't be saved, if so.
 */
async function sealExpense(form: FormData, key: string, row: string): Promise<Refusal | null> {
	const values = expenseValues(form, String(form.get('rate') ?? ''));
	const parsed = parseExpense(values, { memberIds: groupMemberIds(), currency: groupCurrency() });
	if (!parsed.ok) return { error: parsed.error, values };
	const input = parsed.value;
	const details = detailsFromInput(input, String(form.get('autoCategory') ?? '') || null);
	const defaultSplit =
		form.get('makeDefault') === 'on' ? defaultFrom(input.splitMode, input.shares) : null;
	const context = textContext('details', form.get('repeats') ? '' : row);
	leaveOnly(form, ['title', 'notes', 'date', 'clientId', 'repeats']);
	form.set('details', await sealText(key, JSON.stringify(details), context));
	if (defaultSplit) form.set('groupDetails', await sealGroupDetails(key, { defaultSplit }));
	return null;
}

async function sealPayment(form: FormData, key: string, row: string): Promise<Refusal | null> {
	const values = paymentValues(form);
	const parsed = parsePayment(values, { memberIds: groupMemberIds(), currency: groupCurrency() });
	if (!parsed.ok) return { error: parsed.error, values };
	leaveOnly(form, ['date', 'clientId']);
	form.set(
		'details',
		await sealText(
			key,
			JSON.stringify(detailsFromPayment(parsed.value)),
			textContext('details', row)
		)
	);
	return null;
}

/** A budget and end date; an empty form takes them away */
async function sealPlan(form: FormData, key: string): Promise<Refusal | null> {
	const amount = String(form.get('amount') ?? '').trim();
	const budgetCents = amount ? parseAmount(amount, groupCurrency()) : null;
	if (amount && budgetCents === null) return { error: 'amount_invalid' };
	const date = String(form.get('endsOn') ?? '').trim();
	const endsOn = date ? parseDate(date) : null;
	if (endsOn && !endsOn.ok) return { error: endsOn.error };
	leaveOnly(form, []);
	form.set(
		'details',
		await sealGroupDetails(key, { budgetCents, endsOn: endsOn?.ok ? endsOn.value : null })
	);
	return null;
}

/** A group's look and how it settles, from the form editing it */
async function sealGroupForm(form: FormData, key: string): Promise<Refusal | null> {
	const kind = parseKind(form.get('kind'));
	if (!kind.ok) return { error: kind.error };
	const tint = parseTint(form.get('tint'));
	if (!tint.ok) return { error: tint.error };
	const simplifyDebts = form.get('simplifyDebts') === 'on';
	leaveOnly(form, ['name', 'description']);
	form.set(
		'details',
		await sealGroupDetails(key, { kind: kind.value, tint: tint.value, simplifyDebts })
	);
	return null;
}

/** Which insights the group shows; none chosen goes back to its type's suggestions */
async function sealSections(form: FormData, key: string): Promise<Refusal | null> {
	const chosen = form.getAll('section').filter(isSection);
	const kind = (page.data.group?.kind ?? 'other') as GroupKind;
	const insightSections = form.has('reset') ? null : choiceToStore(kind, chosen);
	leaveOnly(form, []);
	form.set('details', await sealGroupDetails(key, { insightSections }));
	return null;
}

/** What these forms hold besides plain text, by the name standing for it in `sealing` */
const SEAL_MONEY: Record<
	string,
	(form: FormData, key: string, row: string) => Promise<Refusal | null>
> = {
	title: sealExpense,
	payment: sealPayment,
	plan: sealPlan,
	groupForm: sealGroupForm,
	sections: sealSections
};

/** The current group's key; null if it has none, undefined if this device doesn't have it */
export async function currentGroupKey() {
	const keyId: string | null | undefined = page.data.group?.keyId;
	if (!keyId) return null;
	return keyFor(keyId);
}

/** For `use:enhance`: seals `names` if the group is encrypted, around what the form does anyway */
export const sealing =
	(names: readonly string[], inner?: SubmitFunction, row?: () => string): SubmitFunction =>
	async (input) => {
		const key = await currentGroupKey();
		if (key === undefined) {
			// Sending it unsealed would put plain text into an encrypted group
			input.cancel();
			window.alert(m.locked_cannot_save());
			return;
		}
		const sealMoney = names.map((name) => SEAL_MONEY[name]).find(Boolean);
		const refused = key && sealMoney ? await sealMoney(input.formData, key, row?.() ?? '') : null;
		if (refused) {
			input.cancel();
			const refusal = { type: 'failure', status: 400, data: refused };
			await applyAction(refusal as unknown as Parameters<typeof applyAction>[0]);
			return;
		}
		if (key) await sealFields(input.formData, key, names, row?.());
		const after = await inner?.(input);
		return async (options) => {
			if (options.result.type === 'failure') {
				options.result.data = await openDeep(options.result.data);
			}
			if (after) await after(options);
			else await options.update();
		};
	};

/**
 * For the forms naming a member of an encrypted group: the server can't compare sealed names, so
 * a name someone already has is caught here. `action`: which form, as the server would say it.
 */
export const nameIsFree =
	(action: string, inner: SubmitFunction): SubmitFunction =>
	async (input) => {
		const { group, members } = page.data as {
			group?: { keyId: string | null };
			members?: { id: string; name: string }[];
		};
		const memberId = input.formData.get('memberId');
		const name = normalizeText(String(input.formData.get('name') ?? '')).toLocaleLowerCase();
		const taken = members?.some(
			(member) => member.id !== memberId && member.name.toLocaleLowerCase() === name
		);
		if (group?.keyId && name && taken) {
			input.cancel();
			const refusal = {
				type: 'failure',
				status: 400,
				data: { action, error: 'member_name_taken', memberId }
			};
			await applyAction(refusal as unknown as Parameters<typeof applyAction>[0]);
			return;
		}
		return inner(input);
	};
