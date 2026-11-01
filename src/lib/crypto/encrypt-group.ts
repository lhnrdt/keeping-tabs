// Encrypts an existing group from the browser (#110): fetches its text, seals it here and sends
// it back in pieces small enough for the server. What's already sealed is skipped and its key used
// again, so running this after an interruption picks up where it was.
import { isJpeg } from '#lib/expense/receipt-image.ts';
import { keyFor, rememberKey } from './keyring';
import { isSealed, keyIdIn, newKey, sealBytes, sealText } from './seal';
import { syncKeys } from './vault';

const BATCH = 100;

type Item = { name: string };
type Text = {
	group: { name: string; description: string | null };
	members: { id: string; name: string }[];
	expenses: {
		id: string;
		title: string;
		notes: string | null;
		items: Item[] | null;
		category: string | null;
	}[];
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

/** Encrypts the group behind `base` (its address); returns its key */
export async function encryptGroup(
	base: string,
	guessCategory: (title: string) => string,
	progress: (done: number, total: number) => void
) {
	const dataUrl = `${base}/encrypt/data`;
	const response = await fetch(dataUrl);
	if (!response.ok) throw new Error(String(response.status));
	const text = (await response.json()) as Text;
	// The group's name goes first: if it's sealed, an earlier run started with that key
	const key = isSealed(text.group.name) ? await keyFor(keyIdIn(text.group.name)) : newKey();
	if (!key) throw new Error('started on another device');
	const keyId = await rememberKey(key);

	const seal = (value: string) => sealText(key, value);
	const sealOptional = async (value: string | null | undefined) => (value ? seal(value) : value);
	const sealItems = async (items: Item[] | null | undefined) =>
		items &&
		Promise.all(
			items.map(async (item) => ({ ...item, name: item.name && (await seal(item.name)) }))
		);

	const send = async (body: unknown) => {
		const answer = await fetch(dataUrl, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (!answer.ok) throw new Error(String(answer.status));
	};

	const members = text.members.filter((row) => !isSealed(row.name));
	const expenses = text.expenses.filter((row) => !isSealed(row.title));
	const comments = text.comments.filter((row) => !isSealed(row.body));
	const rules = text.rules.filter((row) => !isSealed(row.template.title));
	const total =
		1 + members.length + expenses.length + comments.length + rules.length + text.receipts.length;
	let done = 0;
	const step = (count: number) => {
		done += count;
		progress(done, total);
	};

	/** Seals rows and sends them, a piece at a time, under this name of the batch */
	async function sendAll<Row>(
		name: 'members' | 'expenses' | 'comments' | 'rules',
		rows: Row[],
		sealRow: (row: Row) => Promise<unknown>
	) {
		for (let i = 0; i < rows.length; i += BATCH) {
			const piece = rows.slice(i, i + BATCH);
			await send({ batch: { [name]: await Promise.all(piece.map(sealRow)) } });
			step(piece.length);
		}
	}

	if (!isSealed(text.group.name)) {
		await send({
			batch: {
				group: {
					name: await seal(text.group.name),
					description: await sealOptional(text.group.description)
				}
			}
		});
	}
	step(1);
	await sendAll('members', members, async (row) => ({ id: row.id, name: await seal(row.name) }));
	await sendAll('expenses', expenses, async (row) => ({
		id: row.id,
		title: await seal(row.title),
		notes: await sealOptional(row.notes),
		items: row.items ? JSON.stringify(await sealItems(row.items)) : null,
		// Sealed titles can't be guessed from anymore
		autoCategory: row.category ? null : guessCategory(row.title)
	}));
	await sendAll('comments', comments, async (row) => ({ id: row.id, body: await seal(row.body) }));
	await sendAll('rules', rules, async (row) => ({
		id: row.id,
		template: JSON.stringify({
			...row.template,
			title: await seal(row.template.title),
			notes: (await sealOptional(row.template.notes)) ?? null,
			items: (await sealItems(row.template.items)) ?? null
		})
	}));
	for (const receipt of text.receipts) {
		// Not from the browser's cache: an earlier run may have sealed it since
		const photo = await fetch(`${base}/expenses/${receipt.expenseId}/receipts/${receipt.id}`, {
			cache: 'no-cache'
		});
		const bytes = new Uint8Array(await photo.arrayBuffer());
		if (isJpeg(bytes)) {
			await send({ receipt: { id: receipt.id, image: toBase64(await sealBytes(key, bytes)) } });
		}
		step(1);
	}
	await send({ finish: keyId });
	await syncKeys().catch(() => {});
	return key;
}
