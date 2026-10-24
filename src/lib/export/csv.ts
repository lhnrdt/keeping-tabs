// Writes CSV (RFC 4180) that spreadsheets open as UTF-8, the counterpart of import/csv.ts.

/** Spreadsheets run cells starting with these as formulas (CSV injection) */
const FORMULA_START = /^[=+\-@\t\r]/;

/** Text from people (titles, names) as a cell that's never run as a formula */
export const textCell = (text: string) => (FORMULA_START.test(text) ? `'${text}` : text);

/** Undoes textCell when reading a file back in */
export const fromTextCell = (text: string) =>
	text.startsWith("'") && FORMULA_START.test(text.slice(1)) ? text.slice(1) : text;

const field = (value: string) =>
	/[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

export function toCsv(rows: readonly (readonly string[])[]) {
	// The byte order mark makes Excel read the file as UTF-8
	return '\uFEFF' + rows.map((row) => row.map(field).join(',')).join('\r\n') + '\r\n';
}
