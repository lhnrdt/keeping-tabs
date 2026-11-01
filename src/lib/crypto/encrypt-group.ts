// Encrypts an existing group from the browser (#110), or moves an encrypted one to a new key: fetches
// its text, seals it here and sends it back in pieces small enough for the server. What's already
// under the new key is skipped, and the new key is found from the group's name, which goes first, so
// running this after an interruption picks up where it was.
import { isJpeg } from '#lib/expense/receipt-image.ts';
import { keyFor, rememberKey } from './keyring';
import {
	isSealed,
	keyIdIn,
	newKey,
	openBytes,
	openText,
	sealBytes,
	sealText,
	textContext
} from './seal';
import { syncKeys } from './vault';

const BATCH = 100;
/** Someone may add something meanwhile; it gets looked at again, a few times at most */
const PASSES = 3;

type Item = { name: string };
type Details = {
	category?: string | null;
	odometerM?: number | null;
	fuelMl?: number | null;
	sealedDetails?: string | null;
};
type Text = {
	group: { name: string; description: string | null };
	members: { id: string; name: string; paymentDetails: string | null }[];
	expenses: ({
		id: string;
		title: string;
		notes: string | null;
		items: Item[] | null;
	} & Details)[];
	comments: { id: string; body: string }[];
	rules: {
		id: string;
		template: { title: string; notes?: string | null; items?: Item[] | null };
	}[];
	receipts: { id: string; expenseId: string }[];
};

const toBase64 = (bytes: Uint8Array) => {
	let binary = '';
	for (let i = 0; i < bytes.length; i += 32_768) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 32_768));
	}
	return btoa(binary);
};

/** Text as it was typed, whichever key it's under now */
async function readable(value: string) {
	if (!isSealed(value)) return value;
	const key = await keyFor(keyIdIn(value));
	if (!key) throw new Error('a key is missing on this device');
	return openText(key, value);
}

/** A photo as it was taken; null if it's already under the new key */
async function readablePhoto(bytes: Uint8Array, oldKey: string | undefined, context: string) {
	if (isJpeg(bytes)) return bytes;
	return oldKey ? openBytes(oldKey, bytes, context).catch(() => null) : null;
}

/**
 * Encrypts the group behind `base` (its address) under a new key, replacing `currentKeyId` if it has
 * one. Returns the key, and the group's address token if that changed.
 */
export async function encryptGroup(
	base: string,
	currentKeyId: string | null,
	guessCategory: (title: string) => string,
	progress: (done: number, total: number) => void
) {
	const dataUrl = `${base}/encrypt/data`;
	const fetchText = async () => {
		const response = await fetch(dataUrl);
		if (!response.ok) throw new Error(String(response.status));
		return (await response.json()) as Text;
	};
	const send = async (body: unknown) => {
		const answer = await fetch(dataUrl, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (!answer.ok) throw new Error(String(answer.status));
		return (await answer.json()) as { token?: string; key?: string };
	};

	const first = await fetchText();
	const resumed =
		isSealed(first.group.name) && keyIdIn(first.group.name) !== currentKeyId
			? await keyFor(keyIdIn(first.group.name))
			: undefined;
	if (isSealed(first.group.name) && keyIdIn(first.group.name) !== currentKeyId && !resumed) {
		throw new Error('started on another device');
	}
	// A new group key goes to the server first: whoever comes next carries on with the same one
	const begun = currentKeyId ? undefined : (await send({ begin: newKey() })).key;
	const key = resumed ?? begun ?? newKey();
	const keyId = await rememberKey(key);
	const oldKey = currentKeyId ? await keyFor(currentKeyId) : undefined;
	if (currentKeyId && !oldKey) throw new Error('the current key is missing on this device');

	const isDone = (value: string) => isSealed(value) && keyIdIn(value) === keyId;
	const seal = async (value: string, field: string, row?: string) =>
		sealText(key, await readable(value), textContext(field, row));
	const sealOptional = async (value: string | null | undefined, field: string, row?: string) =>
		value ? seal(value, field, row) : value;
	const sealItems = async (items: Item[] | null | undefined, row?: string) =>
		items &&
		Promise.all(
			items.map(async (item) => ({
				...item,
				name: item.name && (await seal(item.name, 'item', row))
			}))
		);

	/** A row's category and car data, however it holds them now */
	const sealDetails = async (row: Details & { title: string }, id?: string) => {
		const details = row.sealedDetails
			? JSON.parse(await readable(row.sealedDetails))
			: {
					category: row.category ?? null,
					autoCategory: row.category ? null : guessCategory(await readable(row.title)),
					odometerM: row.odometerM ?? null,
					fuelMl: row.fuelMl ?? null
				};
		return sealText(key, JSON.stringify(details), textContext('details', id));
	};

	let done = 0;
	/** Seals rows and sends them, a piece at a time, under this name of the batch */
	async function sendAll<Row>(
		name: 'members' | 'expenses' | 'comments' | 'rules',
		rows: Row[],
		total: number,
		sealRow: (row: Row) => Promise<unknown>
	) {
		for (let i = 0; i < rows.length; i += BATCH) {
			const piece = rows.slice(i, i + BATCH);
			await send({ batch: { [name]: await Promise.all(piece.map(sealRow)) } });
			done += piece.length;
			progress(done, total);
		}
	}

	for (let pass = 0, text = first; pass < PASSES; pass++, text = await fetchText()) {
		const members = text.members.filter((row) => !isDone(row.name));
		const expenses = text.expenses.filter((row) => !isDone(row.title));
		const comments = text.comments.filter((row) => !isDone(row.body));
		const rules = text.rules.filter((row) => !isDone(row.template.title));
		// Only the first time: nobody can tell from a photo which key it's under without trying
		const receipts = pass === 0 ? text.receipts : [];
		const sealName = !isDone(text.group.name);
		const left = members.length + expenses.length + comments.length + rules.length;
		if (pass > 0 && !left && !sealName) break;
		const total = done + left + receipts.length + (sealName ? 1 : 0);
		if (sealName) {
			await send({
				batch: {
					group: {
						name: await seal(text.group.name, 'name'),
						description: await sealOptional(text.group.description, 'description')
					}
				}
			});
			done += 1;
			progress(done, total);
		}
		await sendAll('members', members, total, async (row) => ({
			id: row.id,
			name: await seal(row.name, 'name'),
			paymentDetails: await sealOptional(row.paymentDetails, 'payment', row.id)
		}));
		await sendAll('expenses', expenses, total, async (row) => ({
			id: row.id,
			title: await seal(row.title, 'title', row.id),
			notes: await sealOptional(row.notes, 'notes', row.id),
			items: row.items ? JSON.stringify(await sealItems(row.items, row.id)) : null,
			details: await sealDetails(row, row.id)
		}));
		await sendAll('comments', comments, total, async (row) => ({
			id: row.id,
			body: await seal(row.body, 'body', row.id)
		}));
		await sendAll('rules', rules, total, async (row) => ({
			id: row.id,
			template: JSON.stringify({
				...row.template,
				// Bound to no row: it goes on every expense that repeats
				title: await seal(row.template.title, 'title'),
				notes: (await sealOptional(row.template.notes, 'notes')) ?? null,
				items: (await sealItems(row.template.items)) ?? null,
				category: null,
				odometerM: null,
				fuelMl: null,
				sealedDetails: await sealDetails(row.template)
			})
		}));
		for (const receipt of receipts) {
			// Not from the browser's cache: an earlier run may have sealed it since
			const photo = await fetch(`${base}/expenses/${receipt.expenseId}/receipts/${receipt.id}`, {
				cache: 'no-cache'
			});
			const context = textContext('photo', receipt.expenseId);
			const bytes = await readablePhoto(new Uint8Array(await photo.arrayBuffer()), oldKey, context);
			if (bytes) {
				const image = toBase64(await sealBytes(key, bytes, context));
				await send({ receipt: { id: receipt.id, image } });
			}
			done += 1;
			progress(done, total);
		}
	}
	const { token } = await send({ finish: keyId });
	await syncKeys().catch(() => {});
	return { key, token };
}
