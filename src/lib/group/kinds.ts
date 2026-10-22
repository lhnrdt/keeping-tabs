// Group types (SP-18): what a group is for, shown as its icon. The order is the picker order.

export const GROUP_KINDS = [
	'other',
	'trip',
	'home',
	'partner',
	'friends',
	'food',
	'event',
	'car'
] as const;

export type GroupKind = (typeof GROUP_KINDS)[number];

export const DEFAULT_GROUP_KIND: GroupKind = 'other';

export const isGroupKind = (value: unknown): value is GroupKind =>
	GROUP_KINDS.includes(value as GroupKind);
