// Backs a group up and restores it as a new group (#57). Saved in a handful of queries, however
// many rows there are: D1's free plan allows 50 queries per request and 100 bound values per
// query, so rows go in as JSON values and SQLite unpacks them (json_each), as imports do.
import { and, eq, isNull } from 'drizzle-orm';
import { BACKUP_FORMAT, BACKUP_VERSION, type Backup } from '#lib/backup/format.ts';
import type { ExpenseItem } from '#lib/split/items.ts';
import type { ExpenseInput } from '#lib/validation.ts';
import { log } from './activity';
import type { Db } from './db';
import {
	expenseComments,
	expensePayers,
	expenses,
	expenseSplits,
	groups,
	members,
	recurringExpenses
} from './db/schema';
import { active } from './expenses';
import { newShareToken } from './token';

type Group = Backup['group'] & { id: string };

/** The whole group as a backup, without anything that's a person's (format.ts) */
export async function backupOf(db: Db, group: Group): Promise<Backup> {
	const [memberRows, entryRows, splits, payers, comments, rules] = await db.batch([
		db
			.select({ id: members.id, name: members.name, deletedAt: members.deletedAt })
			.from(members)
			.where(eq(members.groupId, group.id))
			.orderBy(members.createdAt),
		db.select().from(expenses).where(active(group.id)).orderBy(expenses.date, expenses.createdAt),
		db
			.select({
				expenseId: expenseSplits.expenseId,
				memberId: expenseSplits.memberId,
				shareCents: expenseSplits.shareCents,
				input: expenseSplits.input
			})
			.from(expenseSplits)
			.innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
			.where(active(group.id)),
		db
			.select({
				expenseId: expensePayers.expenseId,
				memberId: expensePayers.memberId,
				amountCents: expensePayers.amountCents
			})
			.from(expensePayers)
			.innerJoin(expenses, eq(expensePayers.expenseId, expenses.id))
			.where(active(group.id)),
		db
			.select({
				expenseId: expenseComments.expenseId,
				memberId: expenseComments.memberId,
				body: expenseComments.body,
				createdAt: expenseComments.createdAt
			})
			.from(expenseComments)
			.innerJoin(expenses, eq(expenseComments.expenseId, expenses.id))
			.where(active(group.id))
			.orderBy(expenseComments.createdAt),
		db
			.select()
			.from(recurringExpenses)
			.where(and(eq(recurringExpenses.groupId, group.id), isNull(recurringExpenses.stoppedAt)))
	]);
	const of = <T extends { expenseId: string }>(rows: T[]) =>
		Map.groupBy(rows, (row) => row.expenseId);
	const splitsOf = of(splits);
	const payersOf = of(payers);
	const commentsOf = of(comments);
	return {
		format: BACKUP_FORMAT,
		version: BACKUP_VERSION,
		exportedAt: new Date().toISOString(),
		group: {
			name: group.name,
			description: group.description,
			currency: group.currency,
			kind: group.kind,
			tint: group.tint,
			simplifyDebts: group.simplifyDebts,
			insightSections: group.insightSections,
			defaultSplit: group.defaultSplit,
			budgetCents: group.budgetCents,
			endsOn: group.endsOn
		},
		members: memberRows.map(({ id, name, deletedAt }) => ({
			id,
			name,
			removed: deletedAt !== null
		})),
		entries: entryRows.map((entry) => ({
			type: entry.type,
			title: entry.title,
			notes: entry.notes,
			amountCents: entry.amountCents,
			paidBy: entry.paidBy,
			date: entry.date,
			splitMode: entry.splitMode,
			items: entry.items,
			category: entry.category,
			originalCurrency: entry.originalCurrency,
			originalAmountCents: entry.originalAmountCents,
			exchangeRate: entry.exchangeRate,
			odometerM: entry.odometerM,
			fuelMl: entry.fuelMl,
			createdAt: entry.createdAt.getTime(),
			splits: (splitsOf.get(entry.id) ?? []).map(({ memberId, shareCents, input }) => ({
				memberId,
				shareCents,
				input
			})),
			payers: (payersOf.get(entry.id) ?? []).map(({ memberId, amountCents }) => ({
				memberId,
				amountCents
			})),
			comments: (commentsOf.get(entry.id) ?? []).map(({ memberId, body, createdAt }) => ({
				memberId,
				body,
				createdAt: createdAt.getTime()
			}))
		})),
		repeating: rules.map((rule) => ({
			memberId: rule.memberId,
			frequency: rule.frequency,
			added: rule.added,
			nextOn: rule.nextOn,
			template: rule.template as ExpenseInput
		}))
	};
}

/** Rows per JSON value: comfortably below D1's 2 MB for one value */
const ROWS_PER_QUERY = 2_000;

function inPieces<T>(rows: readonly T[]) {
	const pieces: T[][] = [];
	for (let i = 0; i < rows.length; i += ROWS_PER_QUERY) {
		pieces.push(rows.slice(i, i + ROWS_PER_QUERY));
	}
	return pieces;
}

const field = (name: string) => `json_extract(value, '$.${name}')`;
const insertAll = (table: string, columns: Record<string, string>) =>
	`insert into ${table} (${Object.keys(columns).join(', ')})
	select ${Object.values(columns)
		.map((name) => field(name))
		.join(', ')}
	from json_each(?1)`;

const INSERT_MEMBERS = insertAll('members', {
	id: 'id',
	group_id: 'groupId',
	name: 'name',
	created_at: 'createdAt',
	deleted_at: 'deletedAt'
});
const INSERT_EXPENSES = insertAll('expenses', {
	id: 'id',
	group_id: 'groupId',
	type: 'type',
	title: 'title',
	notes: 'notes',
	amount_cents: 'amountCents',
	paid_by: 'paidBy',
	date: 'date',
	split_mode: 'splitMode',
	items: 'items',
	category: 'category',
	original_currency: 'originalCurrency',
	original_amount_cents: 'originalAmountCents',
	exchange_rate: 'exchangeRate',
	odometer_m: 'odometerM',
	fuel_ml: 'fuelMl',
	created_at: 'createdAt',
	updated_at: 'createdAt'
});
const INSERT_SPLITS = insertAll('expense_splits', {
	expense_id: 'expenseId',
	member_id: 'memberId',
	share_cents: 'shareCents',
	input: 'input'
});
const INSERT_PAYERS = insertAll('expense_payers', {
	expense_id: 'expenseId',
	member_id: 'memberId',
	amount_cents: 'amountCents'
});
const INSERT_COMMENTS = insertAll('expense_comments', {
	id: 'id',
	expense_id: 'expenseId',
	member_id: 'memberId',
	body: 'body',
	created_at: 'createdAt'
});

/** The file as a new group with a new link; its members are free to be claimed. Returns the link's token. */
export async function restoreBackup(db: Db, backup: Backup) {
	const groupId = crypto.randomUUID();
	const shareToken = newShareToken();
	const now = Date.now();
	const memberIds = new Map(backup.members.map((member) => [member.id, crypto.randomUUID()]));
	const newId = (id: string) => memberIds.get(id)!;
	const withNewMember = <T extends { memberId: string }>(row: T) => ({
		...row,
		memberId: newId(row.memberId)
	});

	const withNewMembers = (items: ExpenseItem[]) =>
		items.map((item) => ({ ...item, memberIds: item.memberIds.map(newId) }));

	const entries = backup.entries.map((entry) => ({ ...entry, id: crypto.randomUUID() }));
	const defaultSplit = backup.group.defaultSplit && {
		mode: backup.group.defaultSplit.mode,
		inputs: Object.fromEntries(
			Object.entries(backup.group.defaultSplit.inputs).flatMap(([id, input]) =>
				memberIds.has(id) ? [[newId(id), input]] : []
			)
		)
	};

	const d1 = db.$client;
	const prepare = ({ sql: text, params }: { sql: string; params: unknown[] }) =>
		d1.prepare(text).bind(...params);
	const all = (statement: string, rows: readonly unknown[]) =>
		inPieces(rows).map((piece) => d1.prepare(statement).bind(JSON.stringify(piece)));

	// One transaction; members before the expenses that refer to them
	await d1.batch([
		prepare(
			db
				.insert(groups)
				.values({ ...backup.group, defaultSplit, id: groupId, shareToken })
				.toSQL()
		),
		...all(
			INSERT_MEMBERS,
			backup.members.map((member, i) => ({
				id: newId(member.id),
				groupId,
				name: member.name,
				createdAt: now + i,
				deletedAt: member.removed ? now : null
			}))
		),
		...all(
			INSERT_EXPENSES,
			entries.map((entry) => ({
				...entry,
				groupId,
				paidBy: newId(entry.paidBy),
				items: entry.items && JSON.stringify(withNewMembers(entry.items))
			}))
		),
		...all(
			INSERT_SPLITS,
			entries.flatMap(({ id, splits }) =>
				splits.map((split) => ({ ...withNewMember(split), expenseId: id }))
			)
		),
		...all(
			INSERT_PAYERS,
			entries.flatMap(({ id, payers }) =>
				payers.map((payer) => ({ ...withNewMember(payer), expenseId: id }))
			)
		),
		...all(
			INSERT_COMMENTS,
			entries.flatMap(({ id, comments }) =>
				comments.map((comment) => ({
					...withNewMember(comment),
					id: crypto.randomUUID(),
					expenseId: id
				}))
			)
		),
		...backup.repeating.map((rule) =>
			prepare(
				db
					.insert(recurringExpenses)
					.values({
						groupId,
						memberId: rule.memberId && newId(rule.memberId),
						frequency: rule.frequency,
						added: rule.added,
						nextOn: rule.nextOn,
						template: {
							...rule.template,
							paidBy: newId(rule.template.paidBy),
							payers: rule.template.payers?.map(withNewMember) ?? null,
							shares: rule.template.shares.map(withNewMember),
							items: rule.template.items && withNewMembers(rule.template.items)
						}
					})
					.toSQL()
			)
		),
		prepare(
			log(db, groupId, null, 'group.import', {
				source: 'backup',
				imported: entries.length
			}).toSQL()
		)
	]);
	return shareToken;
}
