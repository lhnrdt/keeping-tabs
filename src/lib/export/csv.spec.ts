import { describe, expect, it } from 'vitest';
import { parseCsv } from '#lib/import/csv.ts';
import { fromTextCell, textCell, toCsv } from './csv';

describe('toCsv', () => {
	it('quotes only fields that need it and reads back the same', () => {
		const rows = [
			['Date', 'Description'],
			['2026-01-03', 'Pizza, Wein'],
			['2026-01-04', 'The "good" one\nwith a line break']
		];
		const text = toCsv(rows);
		expect(text).toContain('\r\n2026-01-03,"Pizza, Wein"\r\n');
		expect(parseCsv(text).filter((row) => row.some(Boolean))).toEqual(rows);
	});
});

describe('textCell', () => {
	it.each(['=SUM(A1)', '+1', '-2', '@cmd'])('keeps %s from running as a formula', (text) => {
		expect(textCell(text)).toBe(`'${text}`);
		expect(fromTextCell(textCell(text))).toBe(text);
	});

	it("leaves other text alone, also an apostrophe that's part of it", () => {
		expect(textCell('Anna')).toBe('Anna');
		expect(fromTextCell("'Twas a night")).toBe("'Twas a night");
	});
});
