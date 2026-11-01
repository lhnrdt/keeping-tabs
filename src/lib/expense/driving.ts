// What car groups note with an expense: the odometer reading and litres of fuel. Kept as whole
// metres and millilitres, typed as km and litres. Km driven follow from the readings.
import type { DateRange } from '#lib/insights/period.ts';
import type { Result } from '#lib/validation.ts';

const MAX_KM = 1_000_000;
const MAX_LITRES = 10_000;

/** A positive number with up to `decimals` decimals, in thousandths; null if it's anything else */
function parseThousandths(text: string, decimals: number, max: number): number | null {
	const pattern = new RegExp(`^\\d+(?:[.,]\\d{1,${decimals}})?$`);
	if (!pattern.test(text)) return null;
	const value = Number(text.replace(',', '.'));
	return value > 0 && value <= max ? Math.round(value * 1000) : null;
}

/** Optional km as typed, to metres; empty is none */
export function parseKm(value: unknown): Result<number | null> {
	const text = typeof value === 'string' ? value.trim() : '';
	if (!text) return { ok: true, value: null };
	const metres = parseThousandths(text, 1, MAX_KM);
	return metres === null ? { ok: false, error: 'odometer_invalid' } : { ok: true, value: metres };
}

/** Optional litres as typed, to millilitres; empty is none */
export function parseLitres(value: unknown): Result<number | null> {
	const text = typeof value === 'string' ? value.trim() : '';
	if (!text) return { ok: true, value: null };
	const millilitres = parseThousandths(text, 2, MAX_LITRES);
	return millilitres === null
		? { ok: false, error: 'litres_invalid' }
		: { ok: true, value: millilitres };
}

/** Metres or millilitres as an input's value: "120.5" */
export const quantityInputValue = (thousandths: number | null | undefined) =>
	thousandths ? String(thousandths / 1000) : '';

const number = (value: number, locale: string, digits: number) =>
	new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);

export const formatKm = (metres: number, locale: string) =>
	`${number(metres / 1000, locale, 1)} km`;

export const formatLitres = (millilitres: number, locale: string) =>
	`${number(millilitres / 1000, locale, 2)} l`;

export type DrivingEntry = {
	date: string;
	amountCents: number;
	odometerM?: number | null;
	fuelMl?: number | null;
};

export type Driving = {
	/** The latest reading in the period */
	odometerM: number | null;
	/** Driven in the period, from the reading before it (or its first) to its last */
	drivenM: number;
	/** What the km driven cost: everything spent after the first reading, per km */
	centsPerKm: number | null;
	/** Per 100 km, from the fuel bought after the first reading: what was bought with it fuelled the km before */
	litresPer100Km: number | null;
	/** What the expenses with litres cost, per litre */
	centsPerLitre: number | null;
};

type Reading = DrivingEntry & { odometerM: number };

const within = (date: string, range: DateRange | null) =>
	!range || (date >= range.from && date <= range.to);

/** The sums for a period (null for all of it); null when nothing in it notes a reading or litres */
export function drivingOf(
	entries: readonly DrivingEntry[],
	range: DateRange | null = null
): Driving | null {
	const inPeriod = entries.filter((entry) => within(entry.date, range));
	const fuel = inPeriod.filter((entry) => entry.fuelMl);
	const readings = entries
		.filter((entry): entry is Reading => Boolean(entry.odometerM))
		.toSorted((a, b) => a.date.localeCompare(b.date) || a.odometerM - b.odometerM);
	const read = readings.filter((entry) => within(entry.date, range));
	if (read.length === 0 && fuel.length === 0) return null;

	const end = read.at(-1);
	const before = range ? readings.findLast((entry) => entry.date < range.from) : undefined;
	const start = before ?? read[0];
	const drivenM = start && end ? Math.max(0, end.odometerM - start.odometerM) : 0;
	const afterStart = (entry: DrivingEntry) =>
		start &&
		end &&
		entry.date <= end.date &&
		(entry.date > start.date || (entry.odometerM ?? 0) > start.odometerM);
	const driven = inPeriod.filter(afterStart);
	const spent = driven.reduce((sum, entry) => sum + entry.amountCents, 0);
	const burnt = driven.reduce((sum, entry) => sum + (entry.fuelMl ?? 0), 0);
	const millilitres = fuel.reduce((sum, entry) => sum + entry.fuelMl!, 0);
	const fuelSpent = fuel.reduce((sum, entry) => sum + entry.amountCents, 0);
	return {
		odometerM: end?.odometerM ?? null,
		drivenM,
		centsPerKm: drivenM ? Math.round((spent * 1000) / drivenM) : null,
		litresPer100Km: drivenM && burnt ? (burnt / drivenM) * 100 : null,
		centsPerLitre: millilitres ? Math.round((fuelSpent * 1000) / millilitres) : null
	};
}

/** What an odometer shows: at least six whole km digits, then the tenth */
export function odometerDigits(metres: number) {
	const tenths = Math.floor(metres / 100);
	return {
		whole: [...String(Math.floor(tenths / 10)).padStart(6, '0')],
		tenth: String(tenths % 10)
	};
}

/** A gauge's scale, in l/100 km; a thirstier car rests at its end */
export const CONSUMPTION_SCALE = 15;

/** The needle's angle for a consumption: -90° at empty, 90° at the end of the scale */
export const needleAngle = (litresPer100Km: number) =>
	(Math.min(litresPer100Km, CONSUMPTION_SCALE) / CONSUMPTION_SCALE) * 180 - 90;
