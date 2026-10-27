// Phone notifications (#56) through Web Push: free, from the browser's own push service.
// Without VAPID keys (a machine or environment where they aren't set) it's simply off.
import { buildPushHTTPRequest } from '@pushforge/builder';
import { and, eq, inArray, isNotNull, isNull, ne } from 'drizzle-orm';
import { env } from 'cloudflare:workers';
import { formatAmount } from '#lib/money.ts';
import { m } from '#lib/paraglide/messages.js';
import { isLocale, type Locale } from '#lib/paraglide/runtime.js';
import type { Db } from './db';
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

/** Sends one notification; a subscription the push service no longer knows is removed */
/** What the service worker shows (src/service-worker/push.ts) */
export type PushPayload = { title: string; body: string; url: string; tag: string };

async function send(db: Db, sub: typeof pushSubscriptions.$inferSelect, payload: PushPayload) {
	const privateJWK = keys().VAPID_PRIVATE_KEY;
	if (!privateJWK) return;
	const { endpoint, headers, body } = await buildPushHTTPRequest({
		privateJWK: JSON.parse(privateJWK),
		subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
		message: {
			payload,
			adminContact: 'mailto:noreply@keeping-tabs.workers.dev',
			options: { ttl: 24 * 60 * 60, urgency: 'normal' }
		}
	});
	const response = await fetch(endpoint, { method: 'POST', headers, body });
	if (response.status === 404 || response.status === 410) {
		await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
	}
}

/**
 * Tells the group's other people about a new expense (#56), each in their language. Runs
 * after the answer is sent (waitUntil); a failed notification never fails the expense.
 */
export async function notifyNewExpense(
	db: Db,
	group: { id: string; name: string; shareToken: string; currency: string },
	actorId: string | null,
	expense: { title: string; amountCents: number }
) {
	if (!keys().VAPID_PRIVATE_KEY) return;
	const others = await db
		.select({ personId: members.personId, locale: people.locale, actorName: members.name })
		.from(members)
		.innerJoin(people, eq(members.personId, people.id))
		.where(
			and(
				eq(members.groupId, group.id),
				isNull(members.deletedAt),
				isNotNull(members.personId),
				actorId ? ne(members.id, actorId) : undefined
			)
		);
	if (others.length === 0) return;
	const subs = await db
		.select()
		.from(pushSubscriptions)
		.where(
			inArray(
				pushSubscriptions.personId,
				others.map((other) => other.personId!)
			)
		);
	const [actor] = actorId
		? await db.select({ name: members.name }).from(members).where(eq(members.id, actorId))
		: [];
	await Promise.allSettled(
		subs.map((sub) => {
			const locale: Locale = (() => {
				const chosen = others.find((other) => other.personId === sub.personId)?.locale;
				return isLocale(chosen) ? chosen : 'en';
			})();
			return send(db, sub, {
				title: group.name,
				body: m.push_new_expense(
					{
						name: actor?.name ?? m.activity_someone({}, { locale }),
						title: expense.title,
						amount: formatAmount(expense.amountCents, group.currency, locale)
					},
					{ locale }
				),
				url: `/g/${group.shareToken}`,
				tag: `group-${group.id}`
			});
		})
	);
}
