// A group as a backup file (#57): everything that's the group's, nothing that's a person's.
// No share link, no devices or who claimed which member, no payment details, no history of
// changes. Member ids only tie the file together: restoring gives everything new ones.
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import type { Frequency } from '#lib/expense/recurrence.ts';
import type { GroupKind } from '#lib/group/kinds.ts';
import type { DefaultSplit } from '#lib/split/default-split.ts';
import type { Share } from '#lib/split/compute.ts';
import type { ExpenseItem } from '#lib/split/items.ts';
import type { SplitMode } from '#lib/split/modes.ts';
import type { Tint } from '#lib/tints.ts';
import type { ExpenseInput } from '#lib/validation.ts';

export const BACKUP_FORMAT = 'keeping-tabs-backup';
export const BACKUP_VERSION = 1;

export type BackupGroup = {
	/** Only on its way to the browser, which opens it before saving the file (#110) */
	sealedDetails?: string | null;
	name: string;
	description: string | null;
	currency: string;
	kind: GroupKind;
	tint: Tint | null;
	simplifyDebts: boolean;
	insightSections: string | null;
	defaultSplit: DefaultSplit | null;
	budgetCents: number | null;
	endsOn: string | null;
};

export type BackupMember = { id: string; name: string; removed: boolean };

export type BackupEntry = {
	type: 'expense' | 'payment';
	title: string;
	notes: string | null;
	amountCents: number;
	paidBy: string;
	date: string;
	splitMode: SplitMode;
	items: ExpenseItem[] | null;
	category: ExpenseCategory | null;
	originalCurrency: string | null;
	originalAmountCents: number | null;
	exchangeRate: string | null;
	odometerM: number | null;
	fuelMl: number | null;
	/** ms since 1970; keeps entries of one day in order */
	createdAt: number;
	splits: Share[];
	payers: { memberId: string; amountCents: number }[];
	comments: { memberId: string; body: string; createdAt: number }[];
};

export type BackupRepeating = {
	memberId: string | null;
	frequency: Frequency;
	added: number;
	nextOn: string;
	template: ExpenseInput;
};

export type Backup = {
	format: typeof BACKUP_FORMAT;
	version: typeof BACKUP_VERSION;
	exportedAt: string;
	group: BackupGroup;
	members: BackupMember[];
	entries: BackupEntry[];
	repeating: BackupRepeating[];
};
