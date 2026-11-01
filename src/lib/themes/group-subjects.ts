// What a group is about, in its header (#60, #274): a small flat subject for its type, standing in
// front of the theme's landscape (scenes.ts), so every type looks at home in every theme. On the same
// 400×200 canvas, to the right where the text isn't; `cut` shapes are in the header's own color.
import type { GroupKind } from '#lib/group/kinds.ts';
import type { Scene } from './scenes';

const disc = (x: number, y: number, r: number) =>
	`M${x - r} ${y}a${r} ${r} 0 1 1 ${r * 2} 0a${r} ${r} 0 1 1 ${-r * 2} 0Z`;

/** A round-shouldered person standing on y */
const person = (x: number, y: number, h: number) =>
	`${disc(x, y - h + h * 0.16, h * 0.16)}M${x - h * 0.2} ${y}v${-h * 0.42}q0 ${-h * 0.2} ${h * 0.2} ${-h * 0.2}t${h * 0.2} ${h * 0.2}v${h * 0.42}Z`;

/** A heart around x, y */
const heart = (x: number, y: number, s: number) =>
	`M${x} ${y + s}C${x - s * 1.6} ${y - s * 0.1} ${x - s * 0.7} ${y - s} ${x} ${y - s * 0.3}C${x + s * 0.7} ${y - s} ${x + s * 1.6} ${y - s * 0.1} ${x} ${y + s}Z`;

/** The ground it all stands on */
const GROUND = { d: 'M214 200C262 186 340 180 400 184V200Z', strength: 0.95 };

export const GROUP_SUBJECTS: Record<GroupKind, Scene> = {
	// Where to next: a signpost
	other: {
		shapes: [
			GROUND,
			{ d: 'M306 186V92h8v94Z', strength: 1 },
			{ d: 'M314 100h38l12 10-12 10h-38Z', strength: 1 },
			{ d: 'M306 126h-36l-12 10 12 10h36Z', strength: 0.85 },
			{ d: 'M322 108h28v4h-28Z M272 134h26v4h-26Z', strength: 1, cut: true }
		]
	},
	// A tent under the sky, its door open
	trip: {
		shapes: [
			GROUND,
			{ d: 'M258 186L312 106L366 186Z', strength: 1 },
			{ d: 'M312 138L293 186H331Z', strength: 1, cut: true },
			{ d: 'M312 106v-16l14 6-14 6Z', strength: 0.9 }
		],
		lines: [
			{ d: 'M258 186L240 192', strength: 0.8 },
			{ d: 'M366 186L384 192', strength: 0.8 }
		],
		dots: [
			[264, 96, 2, 0.8],
			[362, 84, 2, 0.8],
			[376, 116, 1.5, 0.7]
		]
	},
	// A cabin with smoke from its chimney
	home: {
		shapes: [
			GROUND,
			{ d: 'M270 186V136h80v50Z', strength: 0.9 },
			{ d: 'M336 124V100h12v36Z', strength: 1 },
			{ d: 'M258 140L310 98L362 140Z', strength: 1 },
			{ d: 'M300 186v-30h20v30Z', strength: 1, cut: true },
			{ d: 'M278 148h14v14h-14Z M328 148h14v14h-14Z', strength: 1, cut: true }
		],
		lines: [{ d: 'M342 92q-6-6 0-12t0-12', strength: 0.8 }]
	},
	// Two on a bench, and what's between them
	partner: {
		shapes: [
			GROUND,
			{ d: person(292, 168, 58) + person(330, 168, 58), strength: 1 },
			{ d: 'M266 164h90v7h-90Z', strength: 1 },
			{ d: 'M274 171h7v15h-7Z M341 171h7v15h-7Z', strength: 0.9 },
			{ d: heart(311, 94, 10), strength: 1 }
		]
	},
	// Friends side by side, tall and small
	friends: {
		shapes: [
			GROUND,
			{ d: person(262, 186, 54) + person(360, 186, 56), strength: 0.8 },
			{ d: person(296, 186, 66) + person(330, 186, 62), strength: 1 }
		]
	},
	// A pot on the table, steaming
	food: {
		shapes: [
			GROUND,
			{ d: 'M256 158h108v7H256Z', strength: 1 },
			{ d: 'M270 165h7v21h-7Z M343 165h7v21h-7Z', strength: 0.9 },
			{ d: 'M282 118h56v30q0 10-10 10h-36q-10 0-10-10Z', strength: 1 },
			{ d: 'M276 110h68v7h-68Z', strength: 1 },
			{ d: 'M304 110v-5q0-4 6-4t6 4v5Z', strength: 1 },
			{ d: 'M272 126h10v7h-10Z M338 126h10v7h-10Z', strength: 1 },
			{ d: 'M298 130h24v5h-24Z', strength: 1, cut: true }
		],
		lines: [
			{ d: 'M294 92q-5-5 0-10t0-10', strength: 0.8 },
			{ d: 'M326 92q-5-5 0-10t0-10', strength: 0.8 }
		]
	},
	// Balloons and bunting: something's on
	event: {
		shapes: [
			GROUND,
			{ d: disc(292, 100, 20), strength: 1 },
			{ d: disc(334, 88, 23), strength: 0.85 },
			{
				d: 'M250 62l12 18 8-23Z M284 52l10 20 11-19Z M320 44l9 21 13-17Z M358 42l6 22 14-14Z',
				strength: 0.9
			}
		],
		lines: [
			{ d: 'M230 66Q310 36 396 40', strength: 0.8 },
			{ d: 'M292 120q6 30-2 66', strength: 0.8 },
			{ d: 'M334 111q-6 34 2 75', strength: 0.8 }
		],
		dots: [
			[262, 132, 2.5, 0.9],
			[368, 128, 2.5, 0.9],
			[252, 160, 2, 0.8],
			[376, 156, 2, 0.8]
		]
	},
	// A little car on the road
	car: {
		shapes: [
			GROUND,
			{
				d: 'M246 176v-14q0-7 8-9l22-5 20-22q4-4 10-4h36q7 0 11 6l14 20 10 3q7 2 7 9v16Z',
				strength: 1
			},
			{ d: 'M286 146l14-15q2-2 6-2h10v17Z M324 129h16q3 0 5 3l10 14h-31Z', strength: 1, cut: true },
			{ d: disc(278, 176, 13) + disc(352, 176, 13), strength: 1 },
			{ d: disc(278, 176, 5) + disc(352, 176, 5), strength: 1, cut: true }
		],
		lines: [{ d: 'M226 194h24M264 192h24M340 191h24', strength: 0.8 }]
	}
};

/** The landscape stays behind, so the subject is what you see */
export const LANDSCAPE_STRENGTH = 0.45;
