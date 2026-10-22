// How group types and tints are presented: icon and label per choice (SSOT for pickers,
// tiles and headers).
import type { IconName } from '#lib/icons.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Tint } from '#lib/tints.ts';
import type { GroupKind } from './kinds';

export const kindIcons: Record<GroupKind, IconName> = {
	other: 'group',
	trip: 'kindTrip',
	home: 'kindHome',
	partner: 'kindPartner',
	friends: 'kindFriends',
	food: 'kindFood',
	event: 'kindEvent',
	car: 'kindCar'
};

export const kindLabels: Record<GroupKind, () => string> = {
	other: m.kind_other,
	trip: m.kind_trip,
	home: m.kind_home,
	partner: m.kind_partner,
	friends: m.kind_friends,
	food: m.kind_food,
	event: m.kind_event,
	car: m.kind_car
};

export const tintLabels: Record<Tint, () => string> = {
	sage: m.tint_sage,
	clay: m.tint_clay,
	sand: m.tint_sand,
	moss: m.tint_moss,
	sky: m.tint_sky
};
