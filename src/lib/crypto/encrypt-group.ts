// Encrypts an existing group from the browser (#110), or moves an encrypted one to a new key: fetches
// its text, seals it here and sends it back in pieces small enough for the server. What's already
// under the new key is skipped, and the new key is found from the group's name, which goes first, so
// running this after an interruption picks up where it was.
import { isJpeg } from '#lib/expense/receipt-image.ts';
import { detailsFromInput, sealedInput } from '#lib/expense/sealed-details.ts';
import type { ExpenseItem } from '#lib/split/items.ts';
import type { ExpenseInput } from '#lib/validation.ts';
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
type Share = { memberId: string; shareCents: number; input: number | null };
type Payer = { memberId: string; amountCents: number };
export type Text = {
	group: {
		name: string;
		description: string | null;
		budgetCents: number | null;
		endsOn: string | null;
		defaultSplit: unknown;
		currency: string;
		kind: string;
		tint: string | null;
		simplifyDebts: boolean;
		insightSections: string | null;
		sealedDetails: string | null;
	};
	members: { id: string; name: string; paymentDetails: string | null }[];
	expenses: {
		id: string;
		type: string;
		title: string;
		notes: string | null;
		items: Item[] | null;
		amountCents: number;
		paidBy: string;
		splitMode: string;
		originalCurrency: string | null;
		originalAmountCents: number | null;
		exchangeRate: string | null;
		category: string | null;
		odometerM: number | null;
		fuelMl: number | null;
		sealedDetails: string | null;
		splits: Share[];
		payers: Payer[];
	}[];
	comments: { id: string; body: string }[];
	rules: {
		id: string;
		memberId: string;
		template: Omit<ExpenseInput, 'sealedDetails' | 'items'> & {
			items: (Item & ExpenseItem)[] | null;
			sealedDetails?: string | null;
		};
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

/** A photo as it was taken; null if it's already under the new key */
async function readablePhoto(bytes: Uint8Array, oldKey: string | undefined, context: string) {
	if (isJpeg(bytes)) return bytes;
	return oldKey ? openBytes(oldKey, bytes, context).catch(() => null) : null;
}

/** How encrypting reaches the group and the keys: from a browser, or on the server itself */
export type EncryptIo = {
	fetchText: () => Promise<Text>;
	send: (step: unknown) => Promise<{ token?: string; key?: string | null }>;
	fetchPhoto: (receipt: { id: string; expenseId: string }) => Promise<Uint8Array>;
	keyFor: (keyId: string) => Promise<string | undefined>;
	rememberKey: (key: string) => Promise<string>;
};

/**
 * Encrypts a group under a new key, replacing `currentKeyId` if it has one. Returns the key, and the
 * group's address token if that changed. `batch` is how many rows go at a time.
 */
export async function encryptWith(
	{ fetchText, send, fetchPhoto, keyFor, rememberKey }: EncryptIo,
	currentKeyId: string | null,
	guessCategory: (title: string) => string,
	progress: (done: number, total: number) => void,
	batch = BATCH
) {
	/** Text as it was typed, whichever key it's under now */
	const readable = async (value: string) => {
		if (!isSealed(value)) return value;
		const old = await keyFor(keyIdIn(value));
		if (!old) throw new Error('a key is missing on this device');
		return openText(old, value);
	};

	let first = await fetchText();
	let resumed: string | undefined;
	if (isSealed(first.group.name) && keyIdIn(first.group.name) !== currentKeyId) {
		resumed = await keyFor(keyIdIn(first.group.name));
		if (!resumed) {
			// Someone else's key change that never finished: theirs goes, this one starts over
			if (!currentKeyId) throw new Error('started on another device');
			await send({ discardRekey: true });
			first = await fetchText();
		}
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

	/** Already sealed details under the new key */
	const resealed = async (sealed: string, id?: string) =>
		sealText(key, await readable(sealed), textContext('details', id));
	const sealJson = (details: unknown, id?: string) =>
		sealText(key, JSON.stringify(details), textContext('details', id));
	/** Text inside the details is as typed: it's all sealed together */
	const openedItems = async (items: Item[] | null) =>
		items && Promise.all(items.map(async (item) => ({ ...item, name: await readable(item.name) })));

	const sealExpenseDetails = async (row: Text['expenses'][number]) => {
		if (row.sealedDetails) return resealed(row.sealedDetails, row.id);
		return sealJson(
			{
				amountCents: row.amountCents,
				paidBy: row.paidBy,
				splitMode: row.splitMode,
				items: await openedItems(row.items),
				splits: row.splits,
				payers: row.payers.length ? row.payers : null,
				originalCurrency: row.originalCurrency,
				originalAmountCents: row.originalAmountCents,
				exchangeRate: row.exchangeRate,
				category: row.category,
				autoCategory:
					row.category || row.type === 'payment' ? null : guessCategory(await readable(row.title)),
				odometerM: row.odometerM,
				fuelMl: row.fuelMl
			},
			row.id
		);
	};

	const sealGroupPlan = (group: Text['group']) =>
		group.sealedDetails
			? resealed(group.sealedDetails)
			: sealJson({
					budgetCents: group.budgetCents,
					endsOn: group.endsOn,
					defaultSplit: group.defaultSplit,
					currency: group.currency,
					kind: group.kind,
					tint: group.tint,
					simplifyDebts: group.simplifyDebts,
					insightSections: group.insightSections
				});

	/** A repeating expense: what stays is only what's needed to add the next one */
	const sealRule = async (rule: Text['rules'][number]) => {
		const { template } = rule;
		const sealedDetails = template.sealedDetails
			? await resealed(template.sealedDetails)
			: await sealJson(
					detailsFromInput(
						{ ...template, items: (await openedItems(template.items)) as ExpenseItem[] | null },
						template.category ? null : guessCategory(await readable(template.title))
					)
				);
		return sealedInput({
			// Bound to no row: it goes on every expense that repeats
			title: await seal(template.title, 'title'),
			notes: (await sealOptional(template.notes, 'notes')) ?? null,
			date: template.date,
			paidBy: rule.memberId,
			sealedDetails
		});
	};

	let done = 0;
	/** Seals rows and sends them, a piece at a time, under this name of the batch */
	async function sendAll<Row>(
		name: 'members' | 'expenses' | 'comments' | 'rules',
		rows: Row[],
		total: number,
		sealRow: (row: Row) => Promise<unknown>
	) {
		for (let i = 0; i < rows.length; i += batch) {
			const piece = rows.slice(i, i + batch);
			await send({ batch: { [name]: await Promise.all(piece.map(sealRow)) } });
			done += piece.length;
			progress(done, total);
		}
	}

	for (let pass = 0, text = first; pass < PASSES; pass++, text = await fetchText()) {
		const members = text.members.filter((row) => !isDone(row.name));
		const expenses = text.expenses.filter((row) => !isDone(row.sealedDetails ?? ''));
		const comments = text.comments.filter((row) => !isDone(row.body));
		const rules = text.rules.filter((row) => !isDone(row.template.sealedDetails ?? ''));
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
						description: await sealOptional(text.group.description, 'description'),
						details: await sealGroupPlan(text.group)
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
			title: row.title && (await seal(row.title, 'title', row.id)),
			notes: await sealOptional(row.notes, 'notes', row.id),
			details: await sealExpenseDetails(row)
		}));
		await sendAll('comments', comments, total, async (row) => ({
			id: row.id,
			body: await seal(row.body, 'body', row.id)
		}));
		await sendAll('rules', rules, total, async (row) => ({
			id: row.id,
			template: JSON.stringify(await sealRule(row))
		}));
		for (const receipt of receipts) {
			const context = textContext('photo', receipt.expenseId);
			const bytes = await readablePhoto(await fetchPhoto(receipt), oldKey, context);
			if (bytes) {
				const image = toBase64(await sealBytes(key, bytes, context));
				await send({ receipt: { id: receipt.id, image } });
			}
			done += 1;
			progress(done, total);
		}
	}
	const { token } = await send({ finish: keyId });
	return { key, token };
}

/** In a browser: the group behind `base` (its address) */
export async function encryptGroup(
	base: string,
	currentKeyId: string | null,
	guessCategory: (title: string) => string,
	progress: (done: number, total: number) => void
) {
	const dataUrl = `${base}/encrypt/data`;
	const result = await encryptWith(
		{
			fetchText: async () => {
				const response = await fetch(dataUrl);
				if (!response.ok) throw new Error(String(response.status));
				return response.json();
			},
			send: async (body) => {
				const answer = await fetch(dataUrl, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(body)
				});
				if (!answer.ok) throw new Error(String(answer.status));
				return answer.json();
			},
			fetchPhoto: async (receipt) => {
				// Not from the browser's cache: an earlier run may have sealed it since
				const photo = await fetch(`${base}/expenses/${receipt.expenseId}/receipts/${receipt.id}`, {
					cache: 'no-cache'
				});
				return new Uint8Array(await photo.arrayBuffer());
			},
			keyFor,
			rememberKey
		},
		currentKeyId,
		guessCategory,
		progress
	);
	await syncKeys().catch(() => {});
	return result;
}
