// Downloads of an encrypted group (#110): the server only has sealed text and money, so the browser
// opens them and makes the file. A plain group's link just downloads as it is.
import { resolve } from '$app/paths';
import { toSplitwiseCsv } from '#lib/export/splitwise.ts';
import { openDeep } from './open-data';

function save(text: string, name: string, type: string) {
	const link = document.createElement('a');
	link.href = URL.createObjectURL(new Blob([text], { type }));
	link.download = name;
	link.click();
	URL.revokeObjectURL(link.href);
}

type ExportRows = {
	members: { id: string; name: string }[];
	formerMembers: { id: string; name: string }[];
	expenses: Parameters<typeof toSplitwiseCsv>[2];
};

type Details = {
	splits?: unknown;
	originalCurrency?: string | null;
	originalAmountCents?: number | null;
	exchangeRate?: string | null;
};

/** A repeating expense as a restored backup expects it: opened, it's in an entry's terms */
const templateOf = ({
	splits,
	originalCurrency,
	originalAmountCents,
	exchangeRate,
	...rest
}: Details) => ({
	...rest,
	shares: splits,
	original: originalCurrency
		? { currency: originalCurrency, amountCents: originalAmountCents, rate: exchangeRate }
		: null
});

/** A backup file, in the form of a plain group's */
const openedBackup = async (sealed: unknown) => {
	const backup = await openDeep(
		sealed as { entries: object[]; repeating: { template: Details }[] }
	);
	return {
		...backup,
		entries: backup.entries.map((entry) => ({
			...entry,
			payers: (entry as { payers?: unknown }).payers ?? []
		})),
		repeating: backup.repeating.map((rule) => ({
			...rule,
			template: rule.template.splits ? templateOf(rule.template) : rule.template
		}))
	};
};

/** For the download links; a plain group needs nothing special */
export const openedDownload =
	(
		group: { keyId: string | null; name: string; shareToken: string; currency: string },
		kind: 'csv' | 'json'
	) =>
	async (event: MouseEvent) => {
		if (!group.keyId) return;
		event.preventDefault();
		const token = group.shareToken;
		if (kind === 'csv') {
			const response = await fetch(resolve('/g/[token]/export', { token }));
			const { members, formerMembers, expenses } = await openDeep<ExportRows>(
				await response.json()
			);
			const csv = toSplitwiseCsv(group.currency, [...members, ...formerMembers], expenses);
			save(csv, `${group.name}.csv`, 'text/csv');
		} else {
			const response = await fetch(resolve('/g/[token]/backup', { token }));
			const opened = await openedBackup(await response.json());
			save(JSON.stringify(opened), `${group.name} backup.json`, 'application/json');
		}
	};
