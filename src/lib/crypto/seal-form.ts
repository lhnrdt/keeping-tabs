// Forms of a group with encrypted text (#110): named fields are sealed in the browser, just
// before sending, so the server only ever sees them sealed. If the server sends them back with
// a refusal, they're opened again for the form.
import type { SubmitFunction } from '$app/forms';
import { page } from '$app/state';
import { m } from '#lib/paraglide/messages.js';
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
