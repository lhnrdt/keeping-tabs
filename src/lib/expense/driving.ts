// What car groups note with an expense: the odometer reading and litres of fuel. Kept as whole
// metres and millilitres, typed as km and litres. Km driven follow from the readings.
import type { DateRange } from '#lib/insights/period.ts';
import type { Units } from '#lib/settings.ts';
import type { Result } from '#lib/validation.ts';

const METRES_PER_MILE = 1609.344;
const MILLILITRES_PER_GALLON = 3785.411784;
const LITRES_PER_100KM_AT_ONE_MPG = 235.214583;
const MAX_DISTANCE = 1_000_000;
const MAX_VOLUME = 10_000;

const metresPer = (units: Units) => (units === 'imperial' ? METRES_PER_MILE : 1000);
const millilitresPer = (units: Units) => (units === 'imperial' ? MILLILITRES_PER_GALLON : 1000);

/** A positive number with up to `decimals` decimals, or null if it's anything else */
function parseQuantity(text: string, decimals: number, max: number): number | null {
	const pattern = new RegExp(`^\\d+(?:[.,]\\d{1,${decimals}})?$`);
	if (!pattern.test(text)) return null;
	const value = Number(text.replace(',', '.'));
	return value > 0 && value <= max ? value : null;
}

/** An optional odometer reading as typed, in km or miles, to metres; empty is none */
export function parseOdometer(value: unknown, units: Units = 'metric'): Result<number | null> {
	const text = typeof value === 'string' ? value.trim() : '';
	if (!text) return { ok: true, value: null };
	const reading = parseQuantity(text, 1, MAX_DISTANCE);
	return reading === null
		? { ok: false, error: 'odometer_invalid' }
		: { ok: true, value: Math.round(reading * metresPer(units)) };
}

/** Optional fuel as typed, in litres or gallons, to millilitres; empty is none */
export function parseFuel(value: unknown, units: Units = 'metric'): Result<number | null> {
	const text = typeof value === 'string' ? value.trim() : '';
	if (!text) return { ok: true, value: null };
	const amount = parseQuantity(text, 2, MAX_VOLUME);
	return amount === null
		? { ok: false, error: 'litres_invalid' }
		: { ok: true, value: Math.round(amount * millilitresPer(units)) };
}

const rounded = (value: number, digits: number) => Number(value.toFixed(digits));

/** Metres as an input's value: "120.5" */
export const odometerInputValue = (metres: number | null | undefined, units: Units = 'metric') =>
	metres ? String(rounded(metres / metresPer(units), 1)) : '';

/** Millilitres as an input's value: "41.27" */
export const fuelInputValue = (millilitres: number | null | undefined, units: Units = 'metric') =>
	millilitres ? String(rounded(millilitres / millilitresPer(units), 2)) : '';

const number = (value: number, locale: string, digits: number) =>
	new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);

export const distanceUnit = (units: Units) => (units === 'imperial' ? 'mi' : 'km');
export const fuelUnit = (units: Units) => (units === 'imperial' ? 'gal' : 'l');

export const formatDistance = (metres: number, locale: string, units: Units = 'metric') =>
	`${number(metres / metresPer(units), locale, 1)} ${distanceUnit(units)}`;

export const formatFuel = (millilitres: number, locale: string, units: Units = 'metric') =>
	`${number(millilitres / millilitresPer(units), locale, 2)} ${fuelUnit(units)}`;

/** Per km or mile, from cents per km */
export const perDistance = (centsPerKm: number, units: Units) =>
	Math.round((centsPerKm * metresPer(units)) / 1000);

/** Per litre or gallon, from cents per litre */
export const perFuel = (centsPerLitre: number, units: Units) =>
	Math.round((centsPerLitre * millilitresPer(units)) / 1000);

/** l/100 km, or miles per gallon */
export const consumptionIn = (litresPer100Km: number, units: Units) =>
	units === 'imperial' ? LITRES_PER_100KM_AT_ONE_MPG / litresPer100Km : litresPer100Km;

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

/** What an odometer shows: at least six whole digits, then the tenth */
export function odometerDigits(metres: number, units: Units = 'metric') {
	// A hair up: 100 miles kept in whole metres must not read 99.9
	const tenths = Math.floor((metres / metresPer(units)) * 10 + 0.004);
	return {
		whole: [...String(Math.floor(tenths / 10)).padStart(6, '0')],
		tenth: String(tenths % 10)
	};
}

/** A dial's scale: up to 15 l per 100 km, or up to 60 miles per gallon */
export const consumptionScale = (units: Units) => (units === 'imperial' ? 60 : 15);

/** The needle's angle for a value on the dial: -90° at its start, 90° at the end of the scale */
export const needleAngle = (value: number, scale: number) =>
	(Math.min(value, scale) / scale) * 180 - 90;
