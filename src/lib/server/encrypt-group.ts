// Turning an existing group into an encrypted one (#110). The browser fetches its text, seals it
// and sends it back in batches; only when everything is in does the group count as encrypted.
// Anything already sealed is skipped, so an interrupted run can simply be repeated.
import { and, eq, inArray, isNull, like, ne } from 'drizzle-orm';
import { log } from './activity';
import type { Db } from './db';
import { isKey, isSealed, keyIdIn } from '#lib/crypto/seal.ts';
import { MAX_RECEIPT_BYTES } from '#lib/expense/receipt-image.ts';
import { handoverEnds, keyReceived, placeholderMember } from './encryption-handover';
import { regenerateShareToken } from './groups';
import {
	rekeyRows,
	expensePayers,
	expenseSplits,
	expenseComments,
	expenseReceipts,
	expenses,
	groups,
	members,
	recurringExpenses
} from './db/schema';

/** Every text and all the money of the group, including what's deleted or stopped */
export async function textOf(db: Db, groupId: string) {
	const inGroup = eq(expenses.groupId, groupId);
	const [group, memberRows, expenseRows, splits, payers, comments, rules, receipts] =
		await db.batch([
			db
				.select({
					name: groups.name,
					description: groups.description,
					budgetCents: groups.budgetCents,
					endsOn: groups.endsOn,
					defaultSplit: groups.defaultSplit,
					sealedDetails: groups.sealedDetails
				})
				.from(groups)
				.where(eq(groups.id, groupId)),
			db
				.select({ id: members.id, name: members.name, paymentDetails: members.paymentDetails })
				.from(members)
				.where(eq(members.groupId, groupId)),
			db
				.select({
					id: expenses.id,
					type: expenses.type,
					title: expenses.title,
					notes: expenses.notes,
					items: expenses.items,
					amountCents: expenses.amountCents,
					paidBy: expenses.paidBy,
					splitMode: expenses.splitMode,
					originalCurrency: expenses.originalCurrency,
					originalAmountCents: expenses.originalAmountCents,
					exchangeRate: expenses.exchangeRate,
					category: expenses.category,
					odometerM: expenses.odometerM,
					fuelMl: expenses.fuelMl,
					sealedDetails: expenses.sealedDetails
				})
				.from(expenses)
				.where(inGroup),
			db
				.select({
					expenseId: expenseSplits.expenseId,
					memberId: expenseSplits.memberId,
					shareCents: expenseSplits.shareCents,
					input: expenseSplits.input
				})
				.from(expenseSplits)
				.innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
				.where(inGroup),
			db
				.select({
					expenseId: expensePayers.expenseId,
					memberId: expensePayers.memberId,
					amountCents: expensePayers.amountCents
				})
				.from(expensePayers)
				.innerJoin(expenses, eq(expensePayers.expenseId, expenses.id))
				.where(inGroup),
			db
				.select({ id: expenseComments.id, body: expenseComments.body })
				.from(expenseComments)
				.innerJoin(expenses, eq(expenseComments.expenseId, expenses.id))
				.where(inGroup),
			db
				.select({
					id: recurringExpenses.id,
					memberId: recurringExpenses.memberId,
					template: recurringExpenses.template
				})
				.from(recurringExpenses)
				.where(eq(recurringExpenses.groupId, groupId)),
			db
				.select({ id: expenseReceipts.id, expenseId: expenseReceipts.expenseId })
				.from(expenseReceipts)
				.innerJoin(expenses, eq(expenseReceipts.expenseId, expenses.id))
				.where(inGroup)
		]);
	const splitsOf = Map.groupBy(splits, (split) => split.expenseId);
	const payersOf = Map.groupBy(payers, (payer) => payer.expenseId);
	return {
		group: group[0],
		members: memberRows,
		expenses: expenseRows.map((row) => ({
			...row,
			splits: (splitsOf.get(row.id) ?? []).map(({ memberId, shareCents, input }) => ({
				memberId,
				shareCents,
				input
			})),
			payers: (payersOf.get(row.id) ?? []).map(({ memberId, amountCents }) => ({
				memberId,
				amountCents
			}))
		})),
		comments,
		rules,
		receipts
	};
}

export type SealedBatch = {
	group?: { name: string; description: string | null; details: string };
	members?: { id: string; name: string; paymentDetails: string | null }[];
	expenses?: {
		id: string;
		title: string;
		notes: string | null;
		details: string;
	}[];
	comments?: { id: string; body: string }[];
	rules?: { id: string; template: string }[];
};

const column = (name: string) =>
	`(select json_extract(value, '$.${name}') from json_each(?1) where json_extract(value, '$.id') = `;

/** Stores sealed text in one go; only for this group's rows, however the ids were chosen */
export async function storeSealed(db: Db, groupId: string, actorId: string, batch: SealedBatch) {
	const d1 = db.$client;
	const ids = "(select json_extract(value, '$.id') from json_each(?1))";
	const statements: D1PreparedStatement[] = [];
	if (batch.group) {
		statements.push(
			d1
				.prepare(
					`update groups set name = ?1, description = ?2, sealed_details = ?3,
					budget_cents = null, ends_on = null, default_split = null, currency = 'EUR',
					kind = 'other', tint = null, simplify_debts = 1, insight_sections = null
					where id = ?4 and name not like 'enc1.%'`
				)
				.bind(batch.group.name, batch.group.description, batch.group.details, groupId)
		);
	}
	if (batch.members?.length) {
		statements.push(
			d1
				.prepare(
					`update members set name = ${column('name')}members.id),
					payment_details = ${column('paymentDetails')}members.id)
					where group_id = ?2 and id in ${ids} and name not like 'enc1.%'`
				)
				.bind(JSON.stringify(batch.members), groupId)
		);
	}
	if (batch.expenses?.length) {
		const rows = JSON.stringify(batch.expenses);
		const inGroup = `expense_id in ${ids} and expense_id in
			(select id from expenses where group_id = ?2 and sealed_details is not null)`;
		statements.push(
			d1
				.prepare(
					`update expenses set title = ${column('title')}expenses.id), notes = ${column('notes')}expenses.id),
					sealed_details = ${column('details')}expenses.id), items = null, amount_cents = 1 /* SEALED_AMOUNT */, paid_by = ?3,
					split_mode = 'equal', updated_at = cast(unixepoch('subsec') * 1000 as integer), original_currency = null, original_amount_cents = null,
					exchange_rate = null, category = null, odometer_m = null, fuel_ml = null
					where group_id = ?2 and id in ${ids} and sealed_details is null`
				)
				.bind(rows, groupId, actorId),
			d1.prepare(`delete from expense_splits where ${inGroup}`).bind(rows, groupId),
			d1.prepare(`delete from expense_payers where ${inGroup}`).bind(rows, groupId)
		);
	}
	if (batch.comments?.length) {
		statements.push(
			d1
				.prepare(
					`update expense_comments set body = ${column('body')}expense_comments.id)
					where id in ${ids} and body not like 'enc1.%'
					and expense_id in (select id from expenses where group_id = ?2)`
				)
				.bind(JSON.stringify(batch.comments), groupId)
		);
	}
	if (batch.rules?.length) {
		statements.push(
			d1
				.prepare(
					`update recurring_expenses set template = ${column('template')}recurring_expenses.id), member_id = ?3
					where group_id = ?2 and id in ${ids} and json_extract(template, '$.sealedDetails') is null`
				)
				.bind(JSON.stringify(batch.rules), groupId, actorId)
		);
	}
	if (statements.length) await d1.batch(statements);
}

export async function storeSealedReceipt(
	db: Db,
	groupId: string,
	receiptId: string,
	image: string
) {
	const owned = db.select({ id: expenses.id }).from(expenses).where(eq(expenses.groupId, groupId));
	await db
		.update(expenseReceipts)
		.set({ image })
		.where(
			and(
				eq(expenseReceipts.id, receiptId),
				inArray(expenseReceipts.expenseId, owned),
				// Only a photo that's still readable, base64 of a JPEG's start
				like(expenseReceipts.image, '/9j/%')
			)
		);
}

/** The key everyone uses for this group's encryption: the first browser's, if two start at once */
export async function beginEncrypting(db: Db, groupId: string, key: string) {
	await db
		.update(groups)
		.set({ transitionKey: key })
		.where(and(eq(groups.id, groupId), isNull(groups.transitionKey), isNull(groups.keyId)));
	const [group] = await db
		.select({ key: groups.transitionKey })
		.from(groups)
		.where(eq(groups.id, groupId));
	return group?.key ?? null;
}

/**
 * All in: it counts as encrypted, and the history forgets the names and titles it recorded. A key
 * replacing another isn't handed over: it's there to keep someone out.
 */
export async function finishEncrypting(
	db: Db,
	groupId: string,
	actorId: string,
	keyId: string,
	replacing: boolean
) {
	const d1 = db.$client;
	const until = replacing ? null : handoverEnds().getTime();
	await d1.batch([
		d1
			.prepare(
				`update activity_log set member_id = null, payload = json_object(
					'expenseId', json_extract(payload, '$.expenseId'),
					'memberId', json_extract(payload, '$.memberId')
				) where group_id = ?1`
			)
			.bind(groupId),
		d1
			.prepare(
				`update groups set key_id = ?1, transition_until = ?2,
				transition_key = case when ?2 is null then null else transition_key end where id = ?3`
			)
			.bind(keyId, until, groupId)
	]);
	await log(db, groupId, actorId, 'group.encrypt', {});
}

type Staged = SealedBatch & { receipts?: { id: string; image: string }[] };

const ROWS_OF: Record<string, (batch: Staged) => { id: string }[] | undefined> = {
	members: (batch) => batch.members,
	expenses: (batch) => batch.expenses,
	comments: (batch) => batch.comments,
	rules: (batch) => batch.rules,
	receipts: (batch) => batch.receipts
};

const sealedIn = (batch: SealedBatch) =>
	[
		batch.group?.name,
		batch.group?.details,
		...(batch.members ?? []).map((row) => row.name),
		...(batch.expenses ?? []).map((row) => row.details),
		...(batch.comments ?? []).map((row) => row.body)
	].filter((text) => text !== undefined);

/** A key change's pieces are sealed under one key, and not the one the group has now */
const underNewKey = (batch: SealedBatch, currentKeyId: string) =>
	sealedIn(batch).every((text) => keyIdIn(text) !== currentKeyId);

/** Sets a key change's rows aside: nothing the group shows is touched until it's complete */
async function stageRekey(db: Db, groupId: string, batch: Staged) {
	const d1 = db.$client;
	const now = Date.now();
	const statements = Object.entries(ROWS_OF).flatMap(([kind, rowsOf]) => {
		const rows = rowsOf(batch);
		return rows?.length
			? [
					d1
						.prepare(
							`insert or replace into rekey_rows (group_id, kind, row_id, value, created_at)
							select ?1, ?2, json_extract(value, '$.id'), value, ?3 from json_each(?4)`
						)
						.bind(groupId, kind, now, JSON.stringify(rows))
				]
			: [];
	});
	if (batch.group) {
		statements.push(
			d1
				.prepare(
					`insert or replace into rekey_rows (group_id, kind, row_id, value, created_at)
					values (?1, 'group', ?1, ?2, ?3)`
				)
				.bind(groupId, JSON.stringify(batch.group), now)
		);
	}
	if (statements.length) await d1.batch(statements);
}

export const discardRekey = (db: Db, groupId: string) =>
	db.delete(rekeyRows).where(eq(rekeyRows.groupId, groupId));

/** Whether the group's text so far under a new key, for a browser to carry on from */
export async function textWithStaged(db: Db, groupId: string) {
	const [text, staged] = await Promise.all([
		textOf(db, groupId),
		db
			.select({ kind: rekeyRows.kind, rowId: rekeyRows.rowId, value: rekeyRows.value })
			.from(rekeyRows)
			.where(and(eq(rekeyRows.groupId, groupId), ne(rekeyRows.kind, 'receipts')))
	]);
	const of = (kind: string) =>
		new Map(
			staged
				.filter((row) => row.kind === kind)
				.map((row) => [row.rowId, JSON.parse(row.value) as Record<string, string>])
		);
	const group = of('group').get(groupId);
	// Without its start under one key there's nothing to carry on from
	if (!group || !isSealed(group.name)) return text;
	const newKeyId = keyIdIn(group.name);
	const underIt = (value: string | undefined) => isSealed(value) && keyIdIn(value) === newKeyId;
	const members = of('members');
	const entries = of('expenses');
	const comments = of('comments');
	const rules = of('rules');
	return {
		...text,
		group: {
			...text.group,
			name: group.name,
			description: group.description,
			sealedDetails: group.details
		},
		members: text.members.map((row) => {
			const done = members.get(row.id);
			return underIt(done?.name) && done
				? { ...row, name: done.name, paymentDetails: done.paymentDetails }
				: row;
		}),
		expenses: text.expenses.map((row) => {
			const done = entries.get(row.id);
			return underIt(done?.details) && done
				? { ...row, title: done.title, notes: done.notes, sealedDetails: done.details }
				: row;
		}),
		comments: text.comments.map((row) => {
			const done = comments.get(row.id);
			return underIt(done?.body) && done ? { ...row, body: done.body } : row;
		}),
		rules: text.rules.map((row) => {
			const done = rules.get(row.id);
			const template = done && JSON.parse(done.template);
			return underIt(template?.sealedDetails) ? { ...row, template } : row;
		})
	};
}

/** All of it here, and under this key? Then it replaces what's there, in one go. */
async function commitRekey(db: Db, groupId: string, placeholder: string, keyId: string) {
	const d1 = db.$client;
	const staged = (kind: string, field: string, table: string) =>
		`(select json_extract(value, '$.${field}') from rekey_rows
		where group_id = ?1 and kind = '${kind}' and row_id = ${table}.id)`;
	const isStaged = (kind: string) =>
		`id in (select row_id from rekey_rows where group_id = ?1 and kind = '${kind}')`;
	const prefix = `enc1.${keyId}.%`;
	const [missing] = (
		await d1
			.prepare(
				`select (select count(*) from members where group_id = ?1 and not ${isStaged('members')})
				+ (select count(*) from expenses where group_id = ?1 and not ${isStaged('expenses')})
				+ (select count(*) from expense_comments where expense_id in
					(select id from expenses where group_id = ?1) and not ${isStaged('comments')})
				+ (select count(*) from recurring_expenses where group_id = ?1 and not ${isStaged('rules')})
				+ (select count(*) from expense_receipts where expense_id in
					(select id from expenses where group_id = ?1) and not ${isStaged('receipts')})
				+ (case when exists (select 1 from rekey_rows where group_id = ?1 and kind = 'group'
					and json_extract(value, '$.name') like ?2) then 0 else 1 end)
				+ (select count(*) from rekey_rows where group_id = ?1 and kind = 'expenses'
					and json_extract(value, '$.details') not like ?2)
				+ (select count(*) from rekey_rows where group_id = ?1 and kind = 'members'
					and json_extract(value, '$.name') not like ?2)
				+ (select count(*) from rekey_rows where group_id = ?1 and kind = 'comments'
					and json_extract(value, '$.body') not like ?2) as missing`
			)
			.bind(groupId, prefix)
			.all<{ missing: number }>()
	).results;
	if (!missing || missing.missing !== 0) return false;
	await d1.batch([
		d1
			.prepare(
				`update groups set
				name = (select json_extract(value, '$.name') from rekey_rows where group_id = ?1 and kind = 'group'),
				description = (select json_extract(value, '$.description') from rekey_rows where group_id = ?1 and kind = 'group'),
				sealed_details = (select json_extract(value, '$.details') from rekey_rows where group_id = ?1 and kind = 'group'),
				key_id = ?2, transition_key = null, transition_until = null
				where id = ?1`
			)
			.bind(groupId, keyId),
		d1
			.prepare(
				`update members set name = ${staged('members', 'name', 'members')},
				payment_details = ${staged('members', 'paymentDetails', 'members')}
				where group_id = ?1 and ${isStaged('members')}`
			)
			.bind(groupId),
		d1
			.prepare(
				`update expenses set title = ${staged('expenses', 'title', 'expenses')},
				notes = ${staged('expenses', 'notes', 'expenses')},
				sealed_details = ${staged('expenses', 'details', 'expenses')},
				paid_by = ?2, updated_at = cast(unixepoch('subsec') * 1000 as integer)
				where group_id = ?1 and ${isStaged('expenses')}`
			)
			.bind(groupId, placeholder),
		d1
			.prepare(
				`update expense_comments set body = ${staged('comments', 'body', 'expense_comments')}
				where ${isStaged('comments')} and expense_id in (select id from expenses where group_id = ?1)`
			)
			.bind(groupId),
		d1
			.prepare(
				`update recurring_expenses set template = ${staged('rules', 'template', 'recurring_expenses')}
				where group_id = ?1 and ${isStaged('rules')}`
			)
			.bind(groupId),
		d1
			.prepare(
				`update expense_receipts set image = ${staged('receipts', 'image', 'expense_receipts')}
				where ${isStaged('receipts')} and expense_id in (select id from expenses where group_id = ?1)`
			)
			.bind(groupId),
		d1.prepare('delete from rekey_rows where group_id = ?1').bind(groupId)
	]);
	return true;
}

export type EncryptStep = {
	begin?: string;
	batch?: SealedBatch;
	receipt?: { id: string; image: string };
	finish?: string;
	received?: boolean;
	/** Someone else's key change that never finished: start over */
	discardRekey?: boolean;
};

const KEY_ID = /^[\w-]{8}$/;

const allSealed = (batch: SealedBatch) =>
	[
		batch.group?.name,
		batch.group?.details,
		...(batch.members ?? []).map((row) => row.name),
		...(batch.expenses ?? []).flatMap((row) => [row.details, row.title || undefined]),
		...(batch.comments ?? []).map((row) => row.body)
	].every((text) => text === undefined || isSealed(text));

/** One step of encrypting a group, from a browser or from the server itself; null if it makes no sense */
export async function encryptStep(
	db: Db,
	group: { id: string; keyId: string | null },
	actorId: string,
	step: EncryptStep,
	/** The server itself, on schedule: `actorId` is only who it says it was, and has no key yet */
	onSchedule = false
): Promise<{ key?: string | null; token?: string } | null> {
	if (step.received) {
		await keyReceived(db, group.id, actorId);
		return {};
	}
	if (step.begin !== undefined) {
		if (!isKey(step.begin) || group.keyId) return null;
		return { key: await beginEncrypting(db, group.id, step.begin) };
	}
	if (step.discardRekey) {
		if (group.keyId) await discardRekey(db, group.id);
		return {};
	}
	const placeholder = (await placeholderMember(db, group.id)) ?? actorId;
	if (step.batch) {
		if (!allSealed(step.batch)) return null;
		if (group.keyId) {
			if (!underNewKey(step.batch, group.keyId)) return null;
			await stageRekey(db, group.id, step.batch);
		} else {
			await storeSealed(db, group.id, placeholder, step.batch);
		}
	}
	if (step.receipt) {
		// Base64 of a photo at most the usual size, plus what sealing adds
		if (step.receipt.image.length > ((MAX_RECEIPT_BYTES + 64) * 4) / 3 + 4) return null;
		if (group.keyId) await stageRekey(db, group.id, { receipts: [step.receipt] });
		else await storeSealedReceipt(db, group.id, step.receipt.id, step.receipt.image);
	}
	if (step.finish !== undefined) {
		if (!KEY_ID.test(step.finish)) return null;
		if (group.keyId) {
			if (!(await commitRekey(db, group.id, placeholder, step.finish))) return null;
			await log(db, group.id, actorId, 'group.encrypt', {});
			await keyReceived(db, group.id, actorId);
			// A new key is for keeping someone out: so the old address goes too
			return { token: await regenerateShareToken(db, group.id, actorId) };
		}
		// All of it first: this can't be declared with the group still readable, or under another key
		const [current] = await db
			.select({ name: groups.name })
			.from(groups)
			.where(eq(groups.id, group.id));
		if (!isSealed(current?.name) || keyIdIn(current.name) !== step.finish) return null;
		await finishEncrypting(db, group.id, actorId, step.finish, false);
		if (!onSchedule) await keyReceived(db, group.id, actorId);
	}
	return {};
}
