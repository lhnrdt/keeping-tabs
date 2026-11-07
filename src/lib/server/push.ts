// Phone notifications (#56) through Web Push: free, from the browser's own push service.
// Without VAPID keys (a machine or environment where they aren't set) it's simply off.
import { isSealed } from '#lib/crypto/seal.ts';
import { buildPushHTTPRequest } from '@pushforge/builder';
import { and, eq, inArray, isNotNull, isNull, ne } from 'drizzle-orm';
import { env } from 'cloudflare:workers';
import { formatAmount } from '#lib/money.ts';
import { m } from '#lib/paraglide/messages.js';
import { isLocale, type Locale } from '#lib/paraglide/runtime.js';
import type { Db } from './db';
import { logError } from './error-log';
import { members, people, pushSubscriptions } from './db/schema';

type Keys = { VAPID_PUBLIC_KEY?: string; VAPID_PRIVATE_KEY?: string };
const keys = () => env as Keys;

/** For the browser to subscribe with; null when notifications are off here */
export const pushPublicKey = () => keys().VAPID_PUBLIC_KEY || null;

export type Subscription = { endpoint: string; keys: { p256dh: string; auth: string } };

export const isSubscription = (value: unknown): value is Subscription => {
	const sub = value as Subscription;
	return (
		typeof sub?.endpoint === 'string' &&
		sub.endpoint.startsWith('https://') &&
		typeof sub.keys?.p256dh === 'string' &&
		typeof sub.keys?.auth === 'string'
	);
};

/** This browser gets the person's notifications (again: the endpoint is the key) */
export async function subscribe(db: Db, personId: string, sub: Subscription) {
	await db
		.insert(pushSubscriptions)
		.values({ endpoint: sub.endpoint, personId, p256dh: sub.keys.p256dh, auth: sub.keys.auth })
		.onConflictDoUpdate({
			target: pushSubscriptions.endpoint,
			set: { personId, p256dh: sub.keys.p256dh, auth: sub.keys.auth }
		});
}

export async function unsubscribe(db: Db, personId: string, endpoint: string) {
	await db
		.delete(pushSubscriptions)
		.where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.personId, personId)));
}

export async function isSubscribed(db: Db, personId: string, endpoint: string) {
	const [row] = await db
		.select({ endpoint: pushSubscriptions.endpoint })
		.from(pushSubscriptions)
		.where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.personId, personId)));
	return Boolean(row);
}

/** What the service worker shows (src/service-worker/push.ts) */
export type PushPayload = {
	title: string;
	body: string;
	url: string;
	tag: string;
	/** Encrypted groups: what to show if this device can't open the rest (#110) */
	fallback?: { title: string; body: string };
};

/**
 * Sends one notification and returns what the push service answered; one it no longer knows is
 * removed, and any refusal is logged by its host (the full address is a secret).
 */
async function send(db: Db, sub: typeof pushSubscriptions.$inferSelect, payload: PushPayload) {
	const privateJWK = keys().VAPID_PRIVATE_KEY;
	if (!privateJWK) return 0;
	const { endpoint, headers, body } = await buildPushHTTPRequest({
		privateJWK: JSON.parse(privateJWK),
		subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
		message: {
			payload,
			adminContact: 'mailto:noreply@keeping-tabs.workers.dev',
			// High: Android holds back anything less while the phone sleeps
			options: { ttl: 24 * 60 * 60, urgency: 'high' }
		}
	});
	const response = await fetch(endpoint, { method: 'POST', headers, body });
	if (response.status === 404 || response.status === 410) {
		await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
	}
	if (!response.ok) {
		logError({
			error: new Error(`Push refused: ${response.status} from ${new URL(endpoint).host}`),
			route: 'push',
			method: 'POST'
		});
	}
	return response.status;
}

/** A test to all of a person's devices; each device's answer from its push service (#256) */
export async function sendTest(db: Db, personId: string, locale: string) {
	const subs = await db
		.select()
		.from(pushSubscriptions)
		.where(eq(pushSubscriptions.personId, personId));
	const chosen: Locale = isLocale(locale) ? locale : 'en';
	return Promise.all(
		subs.map((sub) =>
			send(db, sub, {
				title: m.app_name({}, { locale: chosen }),
				body: m.push_test_body({}, { locale: chosen }),
				url: '/you',
				tag: 'test'
			}).catch((failure: unknown) => {
				logError({ error: failure, route: 'push', method: 'POST' });
				return 0;
			})
		)
	);
}

/** What a notification is about; each can be switched off by whoever gets it (#267) */
export const PUSH_KINDS = ['expense', 'payment', 'changed', 'comment', 'joined'] as const;
export type PushKind = (typeof PUSH_KINDS)[number];
export const isPushKind = (value: unknown): value is PushKind =>
	PUSH_KINDS.includes(value as PushKind);

/** As stored with a person: the kinds they switched off, comma-separated */
export const mutedKinds = (stored: string | null | undefined) =>
	(stored ?? '').split(',').filter(isPushKind);

type Recipient = { personId: string; locale: Locale };

/**
 * The group's people who want this kind, but not whoever did it; only `only` among them if given
 * (e.g. who an expense is about)
 */
export async function recipientsOf(
	db: Db,
	groupId: string,
	actorId: string | null,
	kind: PushKind,
	only?: readonly string[]
): Promise<Recipient[]> {
	const rows = await db
		.select({ personId: members.personId, locale: people.locale, muted: people.pushMuted })
		.from(members)
		.innerJoin(people, eq(members.personId, people.id))
		.where(
			and(
				eq(members.groupId, groupId),
				isNull(members.deletedAt),
				isNotNull(members.personId),
				actorId ? ne(members.id, actorId) : undefined,
				only ? inArray(members.id, [...only]) : undefined
			)
		);
	return rows
		.filter((row) => !mutedKinds(row.muted).includes(kind))
		.map((row) => ({ personId: row.personId!, locale: isLocale(row.locale) ? row.locale : 'en' }));
}

/** One notification to each of their devices, in each one's language; failures are only logged */
export async function sendAll(
	db: Db,
	recipients: readonly Recipient[],
	payload: (locale: Locale) => PushPayload
) {
	if (!keys().VAPID_PRIVATE_KEY || recipients.length === 0) return;
	const subs = await db
		.select()
		.from(pushSubscriptions)
		.where(
			inArray(
				pushSubscriptions.personId,
				recipients.map((recipient) => recipient.personId)
			)
		);
	const sent = await Promise.allSettled(
		subs.map((sub) => {
			const locale = recipients.find((one) => one.personId === sub.personId)?.locale ?? 'en';
			return send(db, sub, payload(locale));
		})
	);
	for (const result of sent) {
		if (result.status === 'rejected') {
			logError({ error: result.reason, route: 'push', method: 'POST' });
		}
	}
}

/** The name of whoever did it, as stored: sealed in an encrypted group, for the device to open */
export async function nameOf(db: Db, memberId: string | null | undefined) {
	if (!memberId) return null;
	const [member] = await db
		.select({ name: members.name })
		.from(members)
		.where(eq(members.id, memberId));
	return member?.name ?? null;
}

/**
 * Tells the group's other people about a new expense (#56), each in their language. Runs
 * after the answer is sent (waitUntil); a failed notification never fails the expense.
 */
export async function notifyNewExpense(
	db: Db,
	group: { id: string; name: string; shareToken: string; currency: string; keyId: string | null },
	actorId: string | null,
	expense: { title: string; amountCents: number },
	/** Encrypted: sealed by the browser, as the server has no amount (#110) */
	sealedAmount?: FormDataEntryValue | null
) {
	if (!keys().VAPID_PRIVATE_KEY) return;
	const recipients = await recipientsOf(db, group.id, actorId, 'expense');
	const actor = await nameOf(db, actorId);
	await sendAll(db, recipients, (locale) => ({
		// In an encrypted group these are sealed: the service worker opens them (#110)
		title: group.name,
		body: m.push_new_expense(
			{
				name: actor ?? m.activity_someone({}, { locale }),
				title: expense.title,
				amount: group.keyId
					? isSealed(sealedAmount)
						? sealedAmount
						: ''
					: formatAmount(expense.amountCents, group.currency, locale)
			},
			{ locale }
		),
		...(group.keyId && {
			fallback: {
				title: m.app_name({}, { locale }),
				body: m.push_new_expense_sealed({}, { locale })
			}
		}),
		url: `/g/${group.shareToken}`,
		tag: `group-${group.id}`
	}));
}
