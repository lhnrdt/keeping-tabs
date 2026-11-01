// Downloads of an encrypted group (#110): the server's file holds sealed text, so the browser
// opens it before saving. A plain group's link just downloads as it is.
import { resolve } from '$app/paths';
import { textCell } from '#lib/export/csv.ts';
import { keyFor } from './keyring';
import { openDeep } from './open-data';
import { contextIn, keyIdIn, openText, SEALED_ANYWHERE } from './seal';

const categoryIn = (details: string) =>
	(details ? (JSON.parse(details) as { category?: string }).category : '') ?? '';

/** A CSV cell's sealed text, opened and quoted the way CSV needs it */
async function openCsv(csv: string) {
	const opened = new Map<string, string>();
	for (const sealed of new Set(csv.match(SEALED_ANYWHERE))) {
		const key = await keyFor(keyIdIn(sealed));
		const text = key ? await openText(key, sealed).catch(() => '') : '';
		// Details stand in for the category they hold
		opened.set(sealed, contextIn(sealed).startsWith('details_') ? categoryIn(text) : text);
	}
	// Sealed text has no commas or quotes, so a cell holding it is unquoted
	return csv.replace(/(?<=^|,)[^,\r\n"]*enc1\.[^,\r\n"]*(?=,|\r?$)/gm, (cell) => {
		const text = textCell(cell.replace(SEALED_ANYWHERE, (sealed) => opened.get(sealed) ?? ''));
		return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
	});
}

function save(text: string, name: string, type: string) {
	const link = document.createElement('a');
	link.href = URL.createObjectURL(new Blob([text], { type }));
	link.download = name;
	link.click();
	URL.revokeObjectURL(link.href);
}

/** For the download links: `undefined` for a plain group, which needs nothing special */
export const openedDownload =
	(group: { keyId: string | null; name: string; shareToken: string }, kind: 'csv' | 'json') =>
	async (event: MouseEvent) => {
		if (!group.keyId) return;
		event.preventDefault();
		const token = group.shareToken;
		const response = await fetch(
			kind === 'csv'
				? resolve('/g/[token]/export', { token })
				: resolve('/g/[token]/backup', { token })
		);
		if (kind === 'csv') {
			save(await openCsv(await response.text()), `${group.name}.csv`, 'text/csv');
		} else {
			const opened = await openDeep(await response.json());
			save(JSON.stringify(opened), `${group.name} backup.json`, 'application/json');
		}
	};
