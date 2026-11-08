// What a group is about, in its header (#60, #274, #327): a small flat subject for its type, drawn
// differently for every theme (subjects/), standing in front of the theme's landscape (scenes.ts). On
// the same 400×200 canvas, to the right where the text isn't; `cut` shapes are in the header's color.
import type { GroupKind } from '#lib/group/kinds.ts';
import type { ThemeId } from './palettes';
import type { Scene } from './scenes';
import { CAR } from './subjects/car';
import { EVENT } from './subjects/event';
import { FOOD } from './subjects/food';
import { FRIENDS } from './subjects/friends';
import { HOME } from './subjects/home';
import { OTHER } from './subjects/other';
import { PARTNER } from './subjects/partner';
import { TRIP } from './subjects/trip';
import { disc, heart } from './draw';

/** Each type, drawn its own way for each theme (#327) */
const SUBJECTS: Record<GroupKind, Record<ThemeId, Scene>> = {
	other: OTHER,
	trip: TRIP,
	home: HOME,
	partner: PARTNER,
	friends: FRIENDS,
	food: FOOD,
	event: EVENT,
	car: CAR
};

export const subjectOf = (kind: GroupKind, theme: ThemeId) => SUBJECTS[kind][theme];

const sun = (x: number, y: number): Scene => ({
	shapes: [{ d: disc(x, y, 13), strength: 0.9, motion: 'pulse', sun: { x, y, r: 13 } }],
	lines: [
		{
			d: `M${x} ${y - 20}v-7M${x} ${y + 20}v7M${x - 20} ${y}h-7M${x + 20} ${y}h7`,
			strength: 0.8,
			rays: true
		}
	]
});

const campfire = (x: number, y: number): Scene => ({
	shapes: [
		{ d: `M${x - 13} ${y}l26-5v5l-26 0Z`, strength: 0.9 },
		{
			d: `M${x} ${y - 3}c-10-7-7-15 0-25c7 10 10 18 0 25Z`,
			strength: 1,
			motion: 'flicker'
		}
	]
});

/** What the scene gains when you're settled up: everyone's fine, so something nice appears */
export const GROUP_SETTLED: Record<GroupKind, Scene> = {
	other: sun(262, 72),
	trip: campfire(238, 190),
	home: sun(258, 82),
	partner: { shapes: [{ d: heart(338, 78, 6), strength: 0.9, motion: 'pulse' }] },
	friends: campfire(236, 190),
	food: { shapes: [{ d: heart(366, 118, 7), strength: 0.9, motion: 'pulse' }] },
	event: {
		shapes: [],
		dots: [
			[244, 110, 3, 0.9],
			[388, 98, 3, 0.9],
			[238, 142, 2.5, 0.8],
			[384, 144, 2.5, 0.8],
			[312, 134, 2.5, 0.8]
		]
	},
	car: sun(258, 70)
};

/** The landscape stays behind, so the subject is what you see */
export const LANDSCAPE_STRENGTH = 0.45;
