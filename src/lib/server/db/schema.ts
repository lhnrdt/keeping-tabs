import { sql } from 'drizzle-orm';
import type { ExpenseItem } from '#lib/split/items.ts';
import { SPLIT_MODES } from '#lib/split/modes.ts';
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import type { GroupKind } from '#lib/group/kinds.ts';
import type { Colors, Locale, Scenery, Theme, Units } from '#lib/settings.ts';
import type { Tint } from '#lib/tints.ts';
import { FREQUENCIES } from '#lib/expense/recurrence.ts';
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
	// What the group is for, shown as its icon (SP-18); see src/lib/group/kinds.ts
	kind: text('kind').$type<GroupKind>().notNull().default('other'),
	// Chosen color; null = derived from the id (src/lib/tints.ts)
	tint: text('tint').$type<Tint>(),
	// Settle up via the fewest payments (A owes B, B owes C → A pays C) instead of paying
	// back each person directly (B-6)
	simplifyDebts: integer('simplify_debts', { mode: 'boolean' }).notNull().default(true),
	// Insight sections chosen for this group, in order, e.g. "overTime,fixedCosts" (#174);
	// null = the group type's suggestions
	insightSections: text('insight_sections'),
	// New expenses start split this way, e.g. {"mode":"percent","inputs":{…}} (#41); null = equal
	defaultSplit: text('default_split', { mode: 'json' }),
	/** What new expenses are typed in, converted into `currency` (#307); null: that one */
	entryCurrency: text('entry_currency'),
	// Which key seals this group's text (#110); null = stored as plain text. Never the key itself
	keyId: text('key_id'),
	// Handing an existing group's key to its people when it was encrypted (#110): they only have the
	// old link, so the server holds it for a while. Set before anything's sealed; gone at the time below
	transitionKey: text('transition_key'),
	transitionUntil: integer('transition_until', { mode: 'timestamp_ms' }),
	// An encrypted group's budget, end date and default split, sealed (#110)
	sealedDetails: text('sealed_details'),
	// When the server last tried encrypting this group by itself (#110), so a big one can't hold up the rest
	encryptTriedAt: integer('encrypt_tried_at', { mode: 'timestamp_ms' }),
	// Optional password on top of the link (A-8), salted and slow (group-password.ts); null = none
	passwordHash: text('password_hash'),
	// Budget (minor units) and end date for trips and events, both optional (#168)
	budgetCents: integer('budget_cents'),
	endsOn: text('ends_on'),
	createdAt: createdAt(),
	deletedAt: deletedAt()
});

/** A person across groups and devices, without an account (A-12, A-13). */
export const people = sqliteTable('people', {
	id: id(),
	// Profile name, pre-filled when creating groups or claiming members
	name: text('name'),
	// Personal settings (S-3, src/lib/settings.ts); null = follow the browser
	locale: text('locale').$type<Locale>(),
	theme: text('theme').$type<Theme>(),
	// The scenery (column named from when it was the whole theme) and the colours (#332)
	accent: text('accent').$type<Scenery>(),
	colors: text('colors').$type<Colors>(),
	// How distances and fuel show, and the currency amounts are also shown in (#238)
	units: text('units').$type<Units>(),
	displayCurrency: text('display_currency'),
	// Chosen avatar, e.g. "deer:moss" (#61, src/lib/avatars.ts); null = initials, derived tint
	avatar: text('avatar'),
	// When they read the friendly note about what the app's creator can see (#112)
	notedAt: integer('noted_at', { mode: 'timestamp_ms' }),
	// Which version of it: when what it says changes, they're shown it once more
	notedVersion: integer('noted_version').notNull().default(0),
	/** What of the onboarding they've been through, as JSON: once per person, on every device (#331) */
	onboarding: text('onboarding'),
	/** Notification kinds switched off, comma-separated (#267) */
	pushMuted: text('push_muted'),
	// How to pay them, e.g. a PayPal.me link or IBAN (#47); shown to people in their groups
	paymentDetails: text('payment_details'),
	// How to pay them, sealed with their vault key (#110): each group gets its own copy from there
	sealedPaymentDetails: text('sealed_payment_details'),
	// Their vault key, sealed with their recovery key, so a new device can get their groups' keys (#110)
	recoveryVault: text('recovery_vault'),
	// Hash of the person's recovery key, if they created one (A-16)
	recoveryHash: text('recovery_hash').unique(),
	createdAt: createdAt()
});

/**
 * Passkey challenges handed out and not used yet (#71): crossed off when answered, so a
 * captured answer can't be sent again. Only hashes; expired ones are worthless.
 */
export const passkeyChallenges = sqliteTable('passkey_challenges', {
	challengeHash: text('challenge_hash').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull()
});

/**
 * Where to send a person's notifications (#56): one browser's Web Push subscription. The
 * endpoint is the push service's address for that browser; the keys encrypt the message.
 */
export const pushSubscriptions = sqliteTable('push_subscriptions', {
	endpoint: text('endpoint').primaryKey(),
	personId: text('person_id')
		.notNull()
		.references(() => people.id, { onDelete: 'cascade' }),
	p256dh: text('p256dh').notNull(),
	auth: text('auth').notNull(),
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
		// e.g. "Chrome · Android", from the browser; when it was last used (#126, at most daily)
		label: text('label'),
		lastSeenAt: integer('last_seen_at', { mode: 'timestamp_ms' }),
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

/** Passkeys that let a person come back on any device (A-18). */
export const passkeys = sqliteTable(
	'passkeys',
	{
		// WebAuthn credential id, base64url
		id: text('id').primaryKey(),
		personId: text('person_id')
			.notNull()
			.references(() => people.id),
		// COSE public key, base64url
		publicKey: text('public_key').notNull(),
		counter: integer('counter').notNull().default(0),
		transports: text('transports', { mode: 'json' }).$type<string[]>(),
		// The vault key, sealed with what only this passkey can produce (PRF), so it brings keys back
		sealedVault: text('sealed_vault'),
		createdAt: createdAt()
	},
	(t) => [index('passkeys_person_idx').on(t.personId)]
);

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
		// How to pay them, this group's copy: sealed if the group is encrypted (#110)
		paymentDetails: text('payment_details'),
		// They have the group's key, so the server needn't keep it for them (#110)
		keyReceived: integer('key_received', { mode: 'boolean' }).notNull().default(false),
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
		splitMode: text('split_mode', { enum: SPLIT_MODES }).notNull().default('equal'),
		// Split by receipt items (#53): what each had, in the typed currency; the shares are exact
		items: text('items', { mode: 'json' }).$type<ExpenseItem[]>(),
		notes: text('notes'),
		// Typed in another currency (#54): that currency, the amount in it and the rate used;
		// amount_cents is the group's currency all the same
		originalCurrency: text('original_currency'),
		originalAmountCents: integer('original_amount_cents'),
		exchangeRate: text('exchange_rate'),
		// What car groups note with an expense: the odometer reading and fuel bought
		odometerM: integer('odometer_m'),
		fuelMl: integer('fuel_ml'),
		category: text('category').$type<ExpenseCategory>(),
		// An encrypted group's money, category and car data (#110), sealed; those columns stay empty there
		sealedDetails: text('sealed_details'),
		// When the group was told about it (#56); each expense only once
		notifiedAt: integer('notified_at', { mode: 'timestamp_ms' }),
		// Where an imported row came from (e.g. "sw:…" for Splitwise), so re-imports skip it (I-3)
		importKey: text('import_key'),
		createdAt: createdAt(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdateFn(() => new Date()),
		deletedAt: deletedAt()
	},
	(t) => [
		index('expenses_group_date_idx').on(t.groupId, t.date),
		uniqueIndex('expenses_group_import_key_idx').on(t.groupId, t.importKey),
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
		// What the user entered, so the split can be edited again (src/lib/split/inputs.ts):
		// exact and adjust → minor units, percent → hundredths of a percent,
		// shares → hundredths of a part, equal → null
		input: integer('input')
	},
	(t) => [
		primaryKey({ columns: [t.expenseId, t.memberId] }),
		index('expense_splits_member_idx').on(t.memberId)
	]
);

/**
 * Who paid an expense when it was several people (#39), each with their part; they add up
 * to its amount. Without rows here, expenses.paid_by paid it all.
 */
export const expensePayers = sqliteTable(
	'expense_payers',
	{
		expenseId: text('expense_id')
			.notNull()
			.references(() => expenses.id, { onDelete: 'cascade' }),
		memberId: text('member_id')
			.notNull()
			.references(() => members.id),
		amountCents: integer('amount_cents').notNull()
	},
	(t) => [primaryKey({ columns: [t.expenseId, t.memberId] })]
);

/** A person's groups' keys, for their other devices (#110) */
export const personKeys = sqliteTable(
	'person_keys',
	{
		personId: text('person_id')
			.notNull()
			.references(() => people.id, { onDelete: 'cascade' }),
		keyId: text('key_id').notNull(),
		// Which vault key it's sealed with: someone can end up with more than one
		vaultId: text('vault_id').notNull(),
		// The group's key, sealed with the person's vault key, which the server never has
		sealed: text('sealed').notNull()
	},
	(t) => [primaryKey({ columns: [t.personId, t.keyId, t.vaultId] })]
);

/** Each of a person's vaults' public keys, so their devices can put keys in each other's (#298) */
export const personVaults = sqliteTable(
	'person_vaults',
	{
		personId: text('person_id')
			.notNull()
			.references(() => people.id, { onDelete: 'cascade' }),
		vaultId: text('vault_id').notNull(),
		publicKey: text('public_key').notNull(),
		// Last said by a device holding it: vaults no device has anymore are left out
		seenAt: integer('seen_at', { mode: 'timestamp_ms' }).notNull()
	},
	(t) => [primaryKey({ columns: [t.personId, t.vaultId] })]
);

/**
 * A group's text and money sealed under a new key, until all of it is here (#110): only then does it
 * replace what's there, all at once, so a key change cut off or sent by mistake leaves nothing broken.
 */
export const rekeyRows = sqliteTable(
	'rekey_rows',
	{
		groupId: text('group_id')
			.notNull()
			.references(() => groups.id, { onDelete: 'cascade' }),
		kind: text('kind').notNull(),
		rowId: text('row_id').notNull(),
		value: text('value').notNull(),
		createdAt: createdAt()
	},
	(t) => [primaryKey({ columns: [t.groupId, t.kind, t.rowId] })]
);

/** A short conversation under an expense (#49), visible to the group; each removes only their own */
export const expenseComments = sqliteTable(
	'expense_comments',
	{
		id: id(),
		expenseId: text('expense_id')
			.notNull()
			.references(() => expenses.id, { onDelete: 'cascade' }),
		memberId: text('member_id')
			.notNull()
			.references(() => members.id),
		body: text('body').notNull(),
		createdAt: createdAt()
	},
	(t) => [index('expense_comments_expense_idx').on(t.expenseId, t.createdAt)]
);

/** Photos of an expense's receipt (#52): a small JPEG as base64; see receipt-image.ts */
export const expenseReceipts = sqliteTable(
	'expense_receipts',
	{
		id: id(),
		expenseId: text('expense_id')
			.notNull()
			.references(() => expenses.id, { onDelete: 'cascade' }),
		memberId: text('member_id')
			.notNull()
			.references(() => members.id),
		image: text('image').notNull(),
		createdAt: createdAt()
	},
	(t) => [index('expense_receipts_expense_idx').on(t.expenseId, t.createdAt)]
);

/**
 * Expenses that repeat (#45): the expense as entered (template, with its first date), how
 * often, and how many times it has been added so far. Stopped ones stay for the record.
 */
export const recurringExpenses = sqliteTable(
	'recurring_expenses',
	{
		id: id(),
		groupId: text('group_id')
			.notNull()
			.references(() => groups.id),
		// The member who set it up; the expenses it adds are theirs
		memberId: text('member_id').references(() => members.id),
		template: text('template', { mode: 'json' }).notNull(),
		frequency: text('frequency', { enum: FREQUENCIES }).notNull(),
		// Added this many times; the next one is time number `added` after the first date
		added: integer('added').notNull().default(1),
		// When the next one is due, for finding what's due quickly
		nextOn: text('next_on').notNull(),
		createdAt: createdAt(),
		stoppedAt: integer('stopped_at', { mode: 'timestamp_ms' })
	},
	(t) => [index('recurring_expenses_due_idx').on(t.stoppedAt, t.nextOn)]
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
		// Encrypted groups: who it was, sealed; memberId stays empty (#110)
		sealedActor: text('sealed_actor'),
		action: text('action').notNull(),
		payload: text('payload', { mode: 'json' }),
		createdAt: createdAt(),
		/** Told the group about it (#267): only ever once */
		notifiedAt: integer('notified_at', { mode: 'timestamp_ms' })
	},
	(t) => [index('activity_log_group_created_idx').on(t.groupId, t.createdAt)]
);
