// Example groups for the local dev database (`pnpm seed`): one per group type, with a few
// months of realistic expenses as Splitwise exports, which the app imports like a user would.

type Row = {
	date: string;
	title: string;
	category: string;
	amount: number;
	payer: string;
	among: string[];
};
export type ExampleGroup = {
	name: string;
	kind: string;
	you: string;
	others: string[];
	rows: Row[];
};

/** A small seeded random, so every run creates the same data */
function random(seed: number) {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
}

const day = (start: string, offset: number) => {
	const date = new Date(`${start}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + offset);
	return date.toISOString().slice(0, 10);
};

const between = (rand: () => number, low: number, high: number) =>
	Math.round((low + rand() * (high - low)) * 100) / 100;

const pick = <T>(rand: () => number, list: readonly T[]) => list[Math.floor(rand() * list.length)];

function trip(): ExampleGroup {
	const rand = random(1);
	const people = ['Anna', 'Ben', 'Cara'];
	const rows: Row[] = [
		{
			date: '2026-08-01',
			title: 'Flüge Oslo–Bodø',
			category: 'Flugzeug',
			amount: 486.6,
			payer: 'Anna',
			among: people
		},
		{
			date: '2026-08-02',
			title: 'Mietwagen',
			category: 'Auto',
			amount: 512,
			payer: 'Ben',
			among: people
		},
		{
			date: '2026-08-02',
			title: 'Rorbu Hütte',
			category: 'Hotel',
			amount: 1044,
			payer: 'Cara',
			among: people
		}
	];
	const daily = [
		['Rema 1000', 'Lebensmittel', 35, 95],
		['Coop Extra', 'Lebensmittel', 40, 110],
		['Fischsuppe Reine', 'Restaurant', 70, 120],
		['Tanken', 'Treibstoff', 55, 85],
		['Bier im Hafen', 'Alkohol', 30, 60],
		['Kajaktour', 'Unterhaltung', 150, 210],
		['Zimtschnecken', 'Essen und Trinken - Sonstiges', 12, 24]
	] as const;
	for (let d = 0; d < 12; d++) {
		for (let n = 0; n < 1 + Math.floor(rand() * 3); n++) {
			const [title, category, low, high] = pick(rand, daily);
			rows.push({
				date: day('2026-08-02', d),
				title,
				category,
				amount: between(rand, low, high),
				payer: pick(rand, people),
				among: people
			});
		}
	}
	return { name: 'Lofoten trip', kind: 'Trip', you: 'Anna', others: ['Ben', 'Cara'], rows };
}

function home(): ExampleGroup {
	const rand = random(2);
	const people = ['Anna', 'Ben', 'Dana'];
	const rows: Row[] = [];
	for (const [i, month] of ['05', '06', '07', '08', '09', '10'].entries()) {
		rows.push({
			date: `2026-${month}-01`,
			title: 'Miete',
			category: 'Miete',
			amount: 1650,
			payer: 'Anna',
			among: people
		});
		rows.push({
			date: `2026-${month}-03`,
			title: 'Strom',
			category: 'Elektrizität',
			amount: 78 + i * 2.4,
			payer: 'Dana',
			among: people
		});
		rows.push({
			date: `2026-${month}-05`,
			title: 'Internet',
			category: 'TV/Telefon/Internet',
			amount: 39.99,
			payer: 'Ben',
			among: people
		});
		for (let n = 0; n < 6 + Math.floor(rand() * 4); n++) {
			const [title, category, low, high] = pick(rand, [
				['Rewe', 'Lebensmittel', 18, 85],
				['Edeka', 'Lebensmittel', 12, 60],
				['dm', 'Haushaltsgegenstände', 8, 35],
				['Putzmittel', 'Reinigung', 6, 22],
				['Pizza-Abend', 'Restaurant', 30, 55]
			] as const);
			rows.push({
				date: `2026-${month}-${String(6 + Math.floor(rand() * 22)).padStart(2, '0')}`,
				title,
				category,
				amount: between(rand, low, high),
				payer: pick(rand, people),
				among: people
			});
		}
	}
	rows.push({
		date: '2026-07-14',
		title: 'Neues Sofa',
		category: 'Möbel',
		amount: 849,
		payer: 'Ben',
		among: people
	});
	return {
		name: 'WG Kastanienallee',
		kind: 'Shared home',
		you: 'Anna',
		others: ['Ben', 'Dana'],
		rows
	};
}

function partner(): ExampleGroup {
	const rand = random(3);
	const people = ['Anna', 'Ben'];
	const rows: Row[] = [];
	const ideas = [
		['Kino', 'Kino', 22, 30],
		['Sushi', 'Restaurant', 45, 80],
		['Konzert', 'Musik', 60, 110],
		['Weinbar', 'Alkohol', 35, 70],
		['Wocheneinkauf', 'Lebensmittel', 60, 120],
		['Brunch', 'Restaurant', 35, 55]
	] as const;
	for (let i = 0; i < 26; i++) {
		const [title, category, low, high] = pick(rand, ideas);
		// Anna has been paying more lately
		const payer = i > 16 ? (rand() < 0.75 ? 'Anna' : 'Ben') : pick(rand, people);
		rows.push({
			date: day('2026-05-02', i * 6),
			title,
			category,
			amount: between(rand, low, high),
			payer,
			among: people
		});
	}
	return { name: 'Anna & Ben', kind: 'Partner', you: 'Anna', others: ['Ben'], rows };
}

function friends(): ExampleGroup {
	const rand = random(4);
	const people = ['Anna', 'Ben', 'Cara', 'Erik', 'Fia'];
	const rows: Row[] = [];
	for (let i = 0; i < 20; i++) {
		const [title, category, low, high] = pick(rand, [
			['Stammtisch', 'Alkohol', 60, 140],
			['Bowling', 'Unterhaltung', 50, 90],
			['Pizza', 'Restaurant', 70, 130],
			['Konzerttickets', 'Musik', 120, 220]
		] as const);
		const among = rand() < 0.3 ? people.slice(0, 4) : people;
		rows.push({
			date: day('2026-03-06', i * 11),
			title,
			category,
			amount: between(rand, low, high),
			payer: pick(rand, ['Ben', 'Ben', 'Cara', 'Anna', 'Erik', 'Fia']),
			among
		});
	}
	return {
		name: 'Freitagsrunde',
		kind: 'Friends',
		you: 'Anna',
		others: ['Ben', 'Cara', 'Erik', 'Fia'],
		rows
	};
}

function food(): ExampleGroup {
	const rand = random(5);
	const people = ['Anna', 'Cara', 'Gus'];
	const rows: Row[] = [];
	for (let i = 0; i < 18; i++) {
		const cooking = rand() < 0.5;
		const [title, category, low, high] = cooking
			? pick(rand, [
					['Kochabend Einkauf', 'Lebensmittel', 25, 55],
					['Markt', 'Lebensmittel', 15, 40]
				] as const)
			: pick(rand, [
					['Trattoria Sole', 'Restaurant', 60, 110],
					['Ramen Ya', 'Restaurant', 45, 75],
					['Trattoria Sole', 'Restaurant', 60, 110]
				] as const);
		rows.push({
			date: day('2026-06-03', i * 7),
			title,
			category,
			amount: between(rand, low, high),
			payer: pick(rand, people),
			among: people
		});
	}
	return { name: 'Kochclub', kind: 'Food', you: 'Anna', others: ['Cara', 'Gus'], rows };
}

function event(): ExampleGroup {
	const people = ['Anna', 'Ben', 'Hanna', 'Ivo'];
	const rows: Row[] = [
		{
			date: '2026-09-01',
			title: 'Location Anzahlung',
			category: 'Allgemein',
			amount: 1200,
			payer: 'Hanna',
			among: people
		},
		{
			date: '2026-09-10',
			title: 'Getränke Großhandel',
			category: 'Alkohol',
			amount: 640.5,
			payer: 'Ivo',
			among: people
		},
		{
			date: '2026-09-12',
			title: 'Catering',
			category: 'Essen und Trinken - Sonstiges',
			amount: 1380,
			payer: 'Anna',
			among: people
		},
		{
			date: '2026-09-15',
			title: 'Deko & Lichterketten',
			category: 'Haushaltsgegenstände',
			amount: 186.3,
			payer: 'Ben',
			among: people
		},
		{
			date: '2026-09-18',
			title: 'DJ',
			category: 'Musik',
			amount: 450,
			payer: 'Hanna',
			among: people
		},
		{
			date: '2026-09-19',
			title: 'Eis & Becher',
			category: 'Lebensmittel',
			amount: 74.9,
			payer: 'Ben',
			among: people
		}
	];
	return {
		name: 'Hannas 30. Geburtstag',
		kind: 'Event',
		you: 'Anna',
		others: ['Ben', 'Hanna', 'Ivo'],
		rows
	};
}

function car(): ExampleGroup {
	const rand = random(7);
	const people = ['Anna', 'Jonas'];
	const rows: Row[] = [];
	for (const [i, month] of ['04', '05', '06', '07', '08', '09', '10'].entries()) {
		rows.push({
			date: `2026-${month}-01`,
			title: 'Versicherung',
			category: 'Auto',
			amount: 64.2,
			payer: 'Jonas',
			among: people
		});
		for (let n = 0; n < 2 + Math.floor(rand() * 2); n++) {
			rows.push({
				date: `2026-${month}-${String(4 + Math.floor(rand() * 24)).padStart(2, '0')}`,
				title: 'Tanken',
				category: 'Treibstoff',
				amount: between(rand, 55 + i * 2, 75 + i * 2),
				payer: pick(rand, people),
				among: people
			});
		}
		if (rand() < 0.4)
			rows.push({
				date: `2026-${month}-20`,
				title: 'Parkhaus',
				category: 'Parken',
				amount: between(rand, 8, 24),
				payer: pick(rand, people),
				among: people
			});
	}
	rows.push({
		date: '2026-06-18',
		title: 'Inspektion',
		category: 'Auto',
		amount: 389,
		payer: 'Anna',
		among: people
	});
	return { name: 'Golf teilen', kind: 'Car', you: 'Anna', others: ['Jonas'], rows };
}

export const EXAMPLE_GROUPS: ExampleGroup[] = [
	trip(),
	home(),
	partner(),
	friends(),
	food(),
	event(),
	car()
];

const cents = (amount: number) => Math.round(amount * 100);
const decimal = (value: number) => (value / 100).toFixed(2);

/** A group's rows as a Splitwise export: each person's net = paid minus share */
export function toSplitwiseCsv(group: ExampleGroup) {
	const people = [group.you, ...group.others];
	const lines = [
		['Datum', 'Beschreibung', 'Kategorie', 'Kosten', 'Währung', ...people].join(','),
		''
	];
	for (const row of group.rows.toSorted((a, b) => a.date.localeCompare(b.date))) {
		const total = cents(row.amount);
		const base = Math.floor(total / row.among.length);
		const rest = total - base * row.among.length;
		const share = new Map(row.among.map((name, i) => [name, base + (i < rest ? 1 : 0)]));
		const nets = people.map((name) => (name === row.payer ? total : 0) - (share.get(name) ?? 0));
		lines.push(
			[row.date, `"${row.title}"`, row.category, decimal(total), 'EUR', ...nets.map(decimal)].join(
				','
			)
		);
	}
	return lines.join('\n');
}
