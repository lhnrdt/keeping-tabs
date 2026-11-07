// Notifications for more than new expenses (#267): a payment to you, an expense changed or
// deleted, a comment, someone joining. The browser asks for one right after doing it, as a request
// of its own like a new expense's (#256); the change it's about is taken from the activity log,
// once. In an encrypted group the server only has sealed names and titles: it sends those for the
// device to open, and tells everyone, as it can't know who an expense or payment is about.
import { and, desc, eq, gt, inArray, isNull } from 'drizzle-orm';
import { formatAmount } from '#lib/money.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Locale } from '#lib/paraglide/runtime.js';
import type { Db } from './db';
import { activityLog, expenseComments, expensePayers, expenses, expenseSplits } from './db/schema';
import { nameOf, recipientsOf, sendAll, type PushKind } from './push';

/** What the browser can ask to be told, and the logged changes each stands for */
export const EVENTS = {
	payment: ['payment.create'],
	changed: ['expense.update', 'expense.delete'],
	comment: ['comment.create'],
	joined: ['member.join', 'member.add']
} as const satisfies Partial<Record<PushKind, readonly string[]>>;
export type PushEvent = keyof typeof EVENTS;
export const isPushEvent = (value: unknown): value is PushEvent =>
	typeof value === 'string' && value in EVENTS;

/** Only right after it happened */
const WITHIN_MS = 60 * 1000;

type Group = {
	id: string;
	name: string;
	shareToken: string;
	currency: string;
	keyId: string | null;
};
type Logged = { action: string; payload: Record<string, unknown> };

/** The actor's latest change of this kind not told about yet, now marked as told */
async function claim(db: Db, groupId: string, actorId: string, event: PushEvent) {
	const [latest] = await db
		.select({ id: activityLog.id, action: activityLog.action, payload: activityLog.payload })
		.from(activityLog)
		.where(
			and(
				eq(activityLog.groupId, groupId),
				eq(activityLog.memberId, actorId),
				inArray(activityLog.action, [...EVENTS[event]]),
				isNull(activityLog.notifiedAt),
				gt(activityLog.createdAt, new Date(Date.now() - WITHIN_MS))
			)
		)
		.orderBy(desc(activityLog.createdAt))
		.limit(1);
	if (!latest) return null;
	const [claimed] = await db
		.update(activityLog)
		.set({ notifiedAt: new Date() })
		.where(and(eq(activityLog.id, latest.id), isNull(activityLog.notifiedAt)))
		.returning({ id: activityLog.id });
	return claimed
		? { action: latest.action, payload: (latest.payload ?? {}) as Record<string, unknown> }
		: null;
}

/** Who an expense is about: who paid and who has a share, and who commented on it */
async function peopleOf(db: Db, expenseId: string, withComments = false) {
	const [entry, splits, payers, comments] = await db.batch([
		db.select({ paidBy: expenses.paidBy }).from(expenses).where(eq(expenses.id, expenseId)),
		db
			.select({ memberId: expenseSplits.memberId })
			.from(expenseSplits)
			.where(eq(expenseSplits.expenseId, expenseId)),
		db
			.select({ memberId: expensePayers.memberId })
			.from(expensePayers)
			.where(eq(expensePayers.expenseId, expenseId)),
		db
			.select({ memberId: expenseComments.memberId })
			.from(expenseComments)
			.where(eq(expenseComments.expenseId, expenseId))
	]);
	return [
		...entry.map((row) => row.paidBy),
		...splits.map((row) => row.memberId),
		...payers.map((row) => row.memberId),
		...(withComments ? comments.map((row) => row.memberId) : [])
	];
}

const titleOf = async (db: Db, expenseId: unknown) => {
	if (typeof expenseId !== 'string') return '';
	const [entry] = await db
		.select({ title: expenses.title })
		.from(expenses)
		.where(eq(expenses.id, expenseId));
	return entry?.title ?? '';
};

/** The actor's latest comment on it */
async function commentOf(db: Db, expenseId: unknown, actorId: string) {
	if (typeof expenseId !== 'string') return '';
	const [comment] = await db
		.select({ body: expenseComments.body })
		.from(expenseComments)
		.where(and(eq(expenseComments.expenseId, expenseId), eq(expenseComments.memberId, actorId)))
		.orderBy(desc(expenseComments.createdAt))
		.limit(1);
	return comment?.body ?? '';
}

/** Who gets told, and what, by the logged change */
async function plan(db: Db, group: Group, actorId: string, { action, payload }: Logged) {
	const sealed = Boolean(group.keyId);
	const expenseId = payload.expenseId;
	const actor = await nameOf(db, actorId);
	const name = (locale: Locale) => actor ?? m.activity_someone({}, { locale });
	if (action === 'payment.create') {
		const to = typeof payload.to === 'string' ? payload.to : null;
		const amount = typeof payload.amountCents === 'number' ? payload.amountCents : 0;
		return {
			kind: 'payment' as const,
			only: sealed || !to ? undefined : [to],
			body: (locale: Locale) =>
				sealed || !to
					? m.push_payment({ name: name(locale) }, { locale })
					: m.push_payment_to_you(
							{ name: name(locale), amount: formatAmount(amount, group.currency, locale) },
							{ locale }
						)
		};
	}
	if (action === 'expense.update' || action === 'expense.delete') {
		const title = await titleOf(db, expenseId);
		const only =
			sealed || typeof expenseId !== 'string' ? undefined : await peopleOf(db, expenseId);
		const message = action === 'expense.update' ? m.push_expense_changed : m.push_expense_deleted;
		return {
			kind: 'changed' as const,
			only,
			body: (locale: Locale) => message({ name: name(locale), title }, { locale })
		};
	}
	if (action === 'comment.create') {
		const [title, comment] = await Promise.all([
			titleOf(db, expenseId),
			commentOf(db, expenseId, actorId)
		]);
		const only =
			sealed || typeof expenseId !== 'string' ? undefined : await peopleOf(db, expenseId, true);
		return {
			kind: 'comment' as const,
			only,
			body: (locale: Locale) => m.push_comment({ name: name(locale), title, comment }, { locale })
		};
	}
	// Someone joined, or was added by whoever did it
	const member =
		action === 'member.add' ? await nameOf(db, payload.memberId as string | undefined) : null;
	return {
		kind: 'joined' as const,
		only: undefined,
		body: (locale: Locale) =>
			member
				? m.push_member_added({ name: name(locale), member }, { locale })
				: m.push_joined({ name: name(locale) }, { locale })
	};
}

/** Tells the group about the actor's latest change of this kind; false if there's none to tell */
export async function notifyEvent(db: Db, group: Group, actorId: string, event: PushEvent) {
	const logged = await claim(db, group.id, actorId, event);
	if (!logged) return false;
	const { kind, only, body } = await plan(db, group, actorId, logged);
	const recipients = await recipientsOf(db, group.id, actorId, kind, only);
	await sendAll(db, recipients, (locale) => ({
		// In an encrypted group the names and titles are sealed: the service worker opens them
		title: group.name,
		body: body(locale),
		...(group.keyId && {
			fallback: {
				title: m.app_name({}, { locale }),
				body: m.push_group_changed_sealed({}, { locale })
			}
		}),
		url:
			typeof logged.payload.expenseId === 'string' && kind !== 'payment'
				? `/g/${group.shareToken}/expenses/${logged.payload.expenseId}`
				: `/g/${group.shareToken}`,
		tag: `group-${group.id}`
	}));
	return true;
}
