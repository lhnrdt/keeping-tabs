// Turning an existing group into an encrypted one (#110). The browser fetches its text, seals it
// and sends it back in batches; only when everything is in does the group count as encrypted.
// Anything already sealed is skipped, so an interrupted run can simply be repeated.
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { log } from './activity';
import type { Db } from './db';
import { isKey, isSealed } from '#lib/crypto/seal.ts';
import { MAX_RECEIPT_BYTES } from '#lib/expense/receipt-image.ts';
import { handoverEnds, keyReceived, placeholderMember } from './encryption-handover';
import { regenerateShareToken } from './groups';
import {
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
					kind = 'other', tint = null, simplify_debts = 1, insight_sections = null where id = ?4`
				)
				.bind(batch.group.name, batch.group.description, batch.group.details, groupId)
		);
	}
	if (batch.members?.length) {
		statements.push(
			d1
				.prepare(
					`update members set name = ${column('name')}members.id),
					payment_details = ${column('paymentDetails')}members.id) where group_id = ?2 and id in ${ids}`
				)
				.bind(JSON.stringify(batch.members), groupId)
		);
	}
	if (batch.expenses?.length) {
		const rows = JSON.stringify(batch.expenses);
		const inGroup = `expense_id in ${ids} and expense_id in (select id from expenses where group_id = ?2)`;
		statements.push(
			d1
				.prepare(
					`update expenses set title = ${column('title')}expenses.id), notes = ${column('notes')}expenses.id),
					sealed_details = ${column('details')}expenses.id), items = null, amount_cents = 1 /* SEALED_AMOUNT */, paid_by = ?3,
					split_mode = 'equal', updated_at = cast(unixepoch('subsec') * 1000 as integer), original_currency = null, original_amount_cents = null,
					exchange_rate = null, category = null, odometer_m = null, fuel_ml = null
					where group_id = ?2 and id in ${ids}`
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
					where id in ${ids} and expense_id in (select id from expenses where group_id = ?2)`
				)
				.bind(JSON.stringify(batch.comments), groupId)
		);
	}
	if (batch.rules?.length) {
		statements.push(
			d1
				.prepare(
					`update recurring_expenses set template = ${column('template')}recurring_expenses.id), member_id = ?3
					where group_id = ?2 and id in ${ids}`
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
		.where(and(eq(expenseReceipts.id, receiptId), inArray(expenseReceipts.expenseId, owned)));
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

export type EncryptStep = {
	begin?: string;
	batch?: SealedBatch;
	receipt?: { id: string; image: string };
	finish?: string;
	received?: boolean;
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
	const placeholder = (await placeholderMember(db, group.id)) ?? actorId;
	if (step.batch) {
		if (!allSealed(step.batch)) return null;
		await storeSealed(db, group.id, placeholder, step.batch);
	}
	if (step.receipt) {
		// Base64 of a photo at most the usual size, plus what sealing adds
		if (step.receipt.image.length > ((MAX_RECEIPT_BYTES + 64) * 4) / 3 + 4) return null;
		await storeSealedReceipt(db, group.id, step.receipt.id, step.receipt.image);
	}
	if (step.finish !== undefined) {
		if (!KEY_ID.test(step.finish)) return null;
		await finishEncrypting(db, group.id, actorId, step.finish, Boolean(group.keyId));
		if (!onSchedule) await keyReceived(db, group.id, actorId);
		// A new key is for keeping someone out: so the old address goes too
		if (group.keyId) return { token: await regenerateShareToken(db, group.id, actorId) };
	}
	return {};
}
