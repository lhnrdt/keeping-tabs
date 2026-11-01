// Turning an existing group into an encrypted one (#110). The browser fetches its text, seals it
// and sends it back in batches; only when everything is in does the group count as encrypted.
// Anything already sealed is skipped, so an interrupted run can simply be repeated.
import { and, eq, inArray } from 'drizzle-orm';
import { log } from './activity';
import type { Db } from './db';
import {
	expenseComments,
	expenseReceipts,
	expenses,
	groups,
	members,
	recurringExpenses
} from './db/schema';

/** Every text of the group, including what's deleted or stopped */
export async function textOf(db: Db, groupId: string) {
	const [group, memberRows, expenseRows, comments, rules, receipts] = await db.batch([
		db
			.select({ name: groups.name, description: groups.description })
			.from(groups)
			.where(eq(groups.id, groupId)),
		db
			.select({ id: members.id, name: members.name })
			.from(members)
			.where(eq(members.groupId, groupId)),
		db
			.select({
				id: expenses.id,
				title: expenses.title,
				notes: expenses.notes,
				items: expenses.items,
				category: expenses.category
			})
			.from(expenses)
			.where(eq(expenses.groupId, groupId)),
		db
			.select({ id: expenseComments.id, body: expenseComments.body })
			.from(expenseComments)
			.innerJoin(expenses, eq(expenseComments.expenseId, expenses.id))
			.where(eq(expenses.groupId, groupId)),
		db
			.select({ id: recurringExpenses.id, template: recurringExpenses.template })
			.from(recurringExpenses)
			.where(eq(recurringExpenses.groupId, groupId)),
		db
			.select({ id: expenseReceipts.id, expenseId: expenseReceipts.expenseId })
			.from(expenseReceipts)
			.innerJoin(expenses, eq(expenseReceipts.expenseId, expenses.id))
			.where(eq(expenses.groupId, groupId))
	]);
	return { group: group[0], members: memberRows, expenses: expenseRows, comments, rules, receipts };
}

export type SealedBatch = {
	group?: { name: string; description: string | null };
	members?: { id: string; name: string }[];
	expenses?: {
		id: string;
		title: string;
		notes: string | null;
		items: string | null;
		autoCategory: string | null;
	}[];
	comments?: { id: string; body: string }[];
	rules?: { id: string; template: string }[];
};

const column = (name: string) =>
	`(select json_extract(value, '$.${name}') from json_each(?1) where json_extract(value, '$.id') = `;

/** Stores sealed text in one go; only for this group's rows, however the ids were chosen */
export async function storeSealed(db: Db, groupId: string, batch: SealedBatch) {
	const d1 = db.$client;
	const ids = "(select json_extract(value, '$.id') from json_each(?1))";
	const statements: D1PreparedStatement[] = [];
	if (batch.group) {
		statements.push(
			d1
				.prepare('update groups set name = ?1, description = ?2 where id = ?3')
				.bind(batch.group.name, batch.group.description, groupId)
		);
	}
	if (batch.members?.length) {
		statements.push(
			d1
				.prepare(
					`update members set name = ${column('name')}members.id) where group_id = ?2 and id in ${ids}`
				)
				.bind(JSON.stringify(batch.members), groupId)
		);
	}
	if (batch.expenses?.length) {
		statements.push(
			d1
				.prepare(
					`update expenses set title = ${column('title')}expenses.id), notes = ${column('notes')}expenses.id),
					items = ${column('items')}expenses.id), auto_category = ${column('autoCategory')}expenses.id)
					where group_id = ?2 and id in ${ids}`
				)
				.bind(JSON.stringify(batch.expenses), groupId)
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
					`update recurring_expenses set template = ${column('template')}recurring_expenses.id)
					where group_id = ?2 and id in ${ids}`
				)
				.bind(JSON.stringify(batch.rules), groupId)
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

/** All in: it counts as encrypted, and the history forgets the names and titles it recorded */
export async function finishEncrypting(db: Db, groupId: string, actorId: string, keyId: string) {
	const d1 = db.$client;
	await d1.batch([
		d1
			.prepare(
				`update activity_log set payload = json_object(
					'expenseId', json_extract(payload, '$.expenseId'),
					'memberId', json_extract(payload, '$.memberId')
				) where group_id = ?1`
			)
			.bind(groupId),
		d1.prepare('update groups set key_id = ?1 where id = ?2').bind(keyId, groupId)
	]);
	await log(db, groupId, actorId, 'group.encrypt', {});
}
