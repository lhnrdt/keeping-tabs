// The kinds of notifications as people see them (#267); the server's list is in server/push.ts.
import { m } from '#lib/paraglide/messages.js';

export const KIND_LABELS = {
	expense: m.push_kind_expense,
	payment: m.push_kind_payment,
	changed: m.push_kind_changed,
	comment: m.push_kind_comment,
	joined: m.push_kind_joined
} as const;
export type Kind = keyof typeof KIND_LABELS;
export const KINDS = Object.keys(KIND_LABELS) as Kind[];
