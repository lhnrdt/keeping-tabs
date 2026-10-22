import { sql } from 'drizzle-orm';
import {
	check,
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex
} from 'drizzle-orm/sqlite-core';

const id = () =>
	text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
	integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date());

const deletedAt = () => integer('deleted_at', { mode: 'timestamp_ms' });

export const groups = sqliteTable('groups', {
	id: id(),
	// Secret part of the share link (A-2). Kept separate from `id` so it can be
	// regenerated without touching foreign keys (A-7).
	shareToken: text('share_token').notNull().unique(),
	name: text('name').notNull(),
	description: text('description'),
	// ISO 4217 code; one currency per group (S-1)
	currency: text('currency').notNull().default('EUR'),
	createdAt: createdAt(),
	deletedAt: deletedAt()
});

/** A person across groups and devices, without an account (A-12, A-13). */
export const people = sqliteTable('people', {
	id: id(),
	// Profile name, pre-filled when creating groups or claiming members
	name: text('name'),
	createdAt: createdAt()
});

/** A browser of a person, identified by the hash of its secret cookie key. */
export const devices = sqliteTable(
	'devices',
	{
		keyHash: text('key_hash').primaryKey(),
		personId: text('person_id')
			.notNull()
			.references(() => people.id),
		createdAt: createdAt()
	},
	(t) => [index('devices_person_idx').on(t.personId)]
);

/** Short-lived, single-use links to use the same identity on another device (A-14). */
export const deviceLinks = sqliteTable('device_links', {
	tokenHash: text('token_hash').primaryKey(),
	personId: text('person_id')
		.notNull()
		.references(() => people.id),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
	usedAt: integer('used_at', { mode: 'timestamp_ms' })
});

export const members = sqliteTable(
	'members',
	{
		id: id(),
		groupId: text('group_id')
			.notNull()
			.references(() => groups.id),
		name: text('name').notNull(),
		// The person who claimed this member (A-4); null until claimed or after release (A-15)
		personId: text('person_id').references(() => people.id),
		createdAt: createdAt(),
		// Removed members stay referenced by past expenses (M-6)
		deletedAt: deletedAt()
	},
	(t) => [
		// M-5: unique among current members only
		uniqueIndex('members_group_name_unique')
			.on(t.groupId, t.name)
			.where(sql`${t.deletedAt} is null`),
		// A person is at most one current member per group
		uniqueIndex('members_group_person_unique')
			.on(t.groupId, t.personId)
			.where(sql`${t.deletedAt} is null and ${t.personId} is not null`)
	]
);

export const expenses = sqliteTable(
	'expenses',
	{
		id: id(),
		groupId: text('group_id')
			.notNull()
			.references(() => groups.id),
		// A payment (B-3) is paid_by → the single member in its splits
		type: text('type', { enum: ['expense', 'payment'] }).notNull(),
		title: text('title').notNull(),
		amountCents: integer('amount_cents').notNull(),
		paidBy: text('paid_by')
			.notNull()
			.references(() => members.id),
		// ISO date (YYYY-MM-DD), no time zone
		date: text('date').notNull(),
		splitMode: text('split_mode', { enum: ['equal', 'exact', 'percent', 'shares'] })
			.notNull()
			.default('equal'),
		notes: text('notes'),
		category: text('category'),
		createdAt: createdAt(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdateFn(() => new Date()),
		deletedAt: deletedAt()
	},
	(t) => [
		index('expenses_group_date_idx').on(t.groupId, t.date),
		check('expenses_amount_positive', sql`${t.amountCents} > 0`)
	]
);

export const expenseSplits = sqliteTable(
	'expense_splits',
	{
		expenseId: text('expense_id')
			.notNull()
			.references(() => expenses.id, { onDelete: 'cascade' }),
		memberId: text('member_id')
			.notNull()
			.references(() => members.id),
		// Resolved amount; splits of an expense always sum to its amount (E-5)
		shareCents: integer('share_cents').notNull(),
		// What the user entered, so the split can be edited again:
		// exact → cents, percent → basis points, shares → weight, equal → null
		input: integer('input')
	},
	(t) => [
		primaryKey({ columns: [t.expenseId, t.memberId] }),
		index('expense_splits_member_idx').on(t.memberId)
	]
);

export const activityLog = sqliteTable(
	'activity_log',
	{
		id: id(),
		groupId: text('group_id')
			.notNull()
			.references(() => groups.id),
		// Null when the visitor hasn't picked a member yet
		memberId: text('member_id').references(() => members.id),
		action: text('action').notNull(),
		payload: text('payload', { mode: 'json' }),
		createdAt: createdAt()
	},
	(t) => [index('activity_log_group_created_idx').on(t.groupId, t.createdAt)]
);
