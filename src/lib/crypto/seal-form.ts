// Forms of a group with encrypted text (#110): named fields are sealed in the browser, just
// before sending, so the server only ever sees them sealed. If the server sends them back with
// a refusal, they're opened again for the form.
import { applyAction, type SubmitFunction } from '$app/forms';
import { page } from '$app/state';
import { m } from '#lib/paraglide/messages.js';
import { parseFuel, parseOdometer } from '#lib/expense/driving.ts';
import { normalizeText, parseCategory } from '#lib/validation.ts';
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

/**
 * An expense's category and car data, sealed together in `details`. What the server would refuse
 * stays as it is, for it to say so; nothing's stored then. Returns what was taken out, to put back
 * into the form if the server refuses something else.
 */
async function sealDetails(form: FormData, key: string, row: string) {
	const units = form.get('units') === 'imperial' ? 'imperial' : 'metric';
	const category = parseCategory(form.get('category'));
	const odometer = parseOdometer(form.get('odometer'), units);
	const fuel = parseFuel(form.get('litres'), units);
	if (!category.ok || !odometer.ok || !fuel.ok) return {};
	const details = {
		category: category.value,
		autoCategory: form.get('autoCategory') || null,
		odometerM: odometer.value,
		fuelMl: fuel.value
	};
	const plain = {
		category: String(form.get('category') ?? ''),
		odometer: String(form.get('odometer') ?? ''),
		litres: String(form.get('litres') ?? '')
	};
	for (const name of ['category', 'autoCategory', 'odometer', 'litres']) form.delete(name);
	const context = textContext('details', form.get('repeats') ? '' : row);
	form.set('details', await sealText(key, JSON.stringify(details), context));
	return plain;
}

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
		const plain =
			key && names.includes('title') ? await sealDetails(input.formData, key, row?.() ?? '') : {};
		if (key) await sealFields(input.formData, key, names, row?.());
		const after = await inner?.(input);
		return async (options) => {
			if (options.result.type === 'failure') {
				const data = await openDeep(options.result.data);
				if (data?.values) data.values = { ...(data.values as object), ...plain };
				options.result.data = data;
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
