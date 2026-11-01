// What car groups note with an expense: km driven and litres of fuel. Kept as whole metres and
// millilitres, typed as km and litres.
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
	return metres === null ? { ok: false, error: 'km_invalid' } : { ok: true, value: metres };
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
	amountCents: number;
	distanceM?: number | null;
	fuelMl?: number | null;
};

export type Driving = {
	metres: number;
	/** Everything spent, per km; null until km are noted */
	centsPerKm: number | null;
	litresPer100Km: number | null;
	/** What the expenses with litres cost, per litre */
	centsPerLitre: number | null;
};

/** The sums over a group's expenses; null when none notes km or litres */
export function drivingOf(entries: readonly DrivingEntry[]): Driving | null {
	let metres = 0;
	let millilitres = 0;
	let spent = 0;
	let fuelSpent = 0;
	for (const { amountCents, distanceM, fuelMl } of entries) {
		spent += amountCents;
		metres += distanceM ?? 0;
		if (fuelMl) {
			millilitres += fuelMl;
			fuelSpent += amountCents;
		}
	}
	if (metres === 0 && millilitres === 0) return null;
	return {
		metres,
		centsPerKm: metres ? Math.round((spent * 1000) / metres) : null,
		litresPer100Km: metres && millilitres ? (millilitres / metres) * 100 : null,
		centsPerLitre: millilitres ? Math.round((fuelSpent * 1000) / millilitres) : null
	};
}
