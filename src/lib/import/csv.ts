// Reads CSV text (RFC 4180): commas, quoted fields with commas, quotes ("") and line breaks.

export function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let quoted = false;
	// A byte order mark is common in exported files
	const input = text.replace(/^\uFEFF/, '');

	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		if (quoted) {
			if (char === '"' && input[i + 1] === '"') field += input[++i];
			else if (char === '"') quoted = false;
			else field += char;
		} else if (char === '"') quoted = true;
		else if (char === ',') {
			row.push(field);
			field = '';
		} else if (char === '\n' || char === '\r') {
			if (char === '\r' && input[i + 1] === '\n') i++;
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
		} else field += char;
	}
	if (field || row.length) rows.push([...row, field]);
	return rows;
}
