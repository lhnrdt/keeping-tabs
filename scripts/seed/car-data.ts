// A car group for the local dev database (`pnpm seed:car`) that shows every car insight: bought
// two years ago, filled up every couple of weeks with odometer and litres, insured each year,
// a few repairs, parking and tolls, paid by different people.

export type CarRow = {
	date: string;
	title: string;
	/** As the form's category tile says it */
	category: 'Purchase' | 'Fuel' | 'Insurance' | 'Repairs' | 'Parking' | 'Tolls';
	amount: number;
	payer: string;
	odometerKm?: number;
	litres?: number;
};

/** A small seeded random, so every run creates the same data */
function random(seed: number) {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
}

const day = (start: Date, offset: number) => {
	const date = new Date(start);
	date.setUTCDate(date.getUTCDate() + offset);
	return date.toISOString().slice(0, 10);
};

const MONTHS = 26;

export function carRows(today = new Date()): CarRow[] {
	const rand = random(7);
	const between = (low: number, high: number) =>
		Math.round((low + rand() * (high - low)) * 100) / 100;
	const payer = () => (rand() < 0.55 ? 'Anna' : rand() < 0.8 ? 'Ben' : 'Cara');
	const start = new Date(today);
	start.setUTCMonth(start.getUTCMonth() - MONTHS);
	const days = Math.round((today.getTime() - start.getTime()) / 86_400_000);

	let km = 48_200;
	const rows: CarRow[] = [
		{
			date: day(start, 0),
			title: 'Bought the car (used Golf)',
			category: 'Purchase',
			amount: 14_500,
			payer: 'Anna',
			odometerKm: km
		}
	];
	// Fill-ups: more km in summer, the price drifting a little
	for (let offset = between(8, 14); offset < days - 2; offset += between(10, 20)) {
		const date = day(start, Math.round(offset));
		const month = Number(date.slice(5, 7));
		const summer = month >= 6 && month <= 8;
		const litres = Math.round(between(32, 48) * 100) / 100;
		const per100 = between(5.6, 7.2);
		km += Math.round((litres / per100) * 100 * (summer ? 1.1 : 1));
		const price = between(1.62, 1.89);
		rows.push({
			date,
			title: summer && rand() < 0.4 ? 'Fuel on the motorway' : 'Fuel',
			category: 'Fuel',
			amount: Math.round(litres * price * 100) / 100,
			payer: payer(),
			odometerKm: km,
			litres
		});
	}
	// Insurance once a year, from the day it was bought
	for (let year = 0; year * 365 < days; year++) {
		rows.push({
			date: day(start, year * 365 + 1),
			title: 'Car insurance',
			category: 'Insurance',
			amount: 684 + year * 36,
			payer: 'Ben'
		});
	}
	const repairs: [number, string, number][] = [
		[40, 'New wiper blades', 34.9],
		[190, 'Winter tyres', 520],
		[370, 'Inspection and service', 389],
		[540, 'Brake pads and discs', 642],
		[600, 'Summer tyres changed', 45],
		[735, 'Inspection and service', 412]
	];
	for (const [offset, title, amount] of repairs.filter(([offset]) => offset < days)) {
		rows.push({ date: day(start, offset), title, category: 'Repairs', amount, payer: payer() });
	}
	for (let offset = 5; offset < days; offset += Math.round(between(18, 40))) {
		rows.push({
			date: day(start, offset),
			title: rand() < 0.5 ? 'Parking in town' : 'Parking garage',
			category: 'Parking',
			amount: between(3, 18),
			payer: payer()
		});
	}
	for (const offset of [210, 230, 575].filter((offset) => offset < days)) {
		rows.push({
			date: day(start, offset),
			title: 'Motorway tolls',
			category: 'Tolls',
			amount: between(18, 46),
			payer: payer()
		});
	}
	return rows.sort((a, b) => a.date.localeCompare(b.date));
}
