import { describe, expect, it } from 'vitest';
import { BACKUP_FORMAT, BACKUP_VERSION } from './format';
import { parseBackup } from './parse';

const valid = () => ({
	format: BACKUP_FORMAT,
	version: BACKUP_VERSION,
	exportedAt: '2026-11-01T10:00:00.000Z',
	group: { name: 'Flat', currency: 'EUR', kind: 'home' },
	members: [
		{ id: 'a', name: 'Anna', removed: false },
		{ id: 'b', name: 'Ben', removed: false }
	],
	entries: [
		{
			type: 'expense',
			title: 'Dinner',
			notes: null,
			amountCents: 3000,
			paidBy: 'a',
			date: '2026-10-01',
			splitMode: 'equal',
			category: 'dining',
			createdAt: 1,
			splits: [
				{ memberId: 'a', shareCents: 1500, input: null },
				{ memberId: 'b', shareCents: 1500, input: null }
			],
			payers: [],
			comments: [{ memberId: 'b', body: 'Thanks', createdAt: 2 }]
		}
	],
	repeating: []
});

const broken = (change: (backup: ReturnType<typeof valid>) => void) => {
	const backup = valid();
	change(backup);
	return parseBackup(JSON.stringify(backup));
};
const INVALID = { ok: false, error: 'backup_invalid' };

describe('parseBackup', () => {
	it('reads a good file', () => {
		const result = parseBackup(JSON.stringify(valid()));
		expect(result.ok && result.value.entries[0].comments[0].body).toBe('Thanks');
	});

	it('refuses what is not a backup', () => {
		expect(parseBackup('not json')).toEqual(INVALID);
		expect(parseBackup('[]')).toEqual(INVALID);
		expect(broken((backup) => (backup.format = 'other' as never))).toEqual(INVALID);
		expect(broken((backup) => (backup.version = 99 as never))).toEqual(INVALID);
	});

	it('refuses shares that do not add up', () => {
		expect(broken((backup) => (backup.entries[0].splits[0].shareCents = 1))).toEqual(INVALID);
	});

	it('refuses members it does not know', () => {
		expect(broken((backup) => (backup.entries[0].paidBy = 'x'))).toEqual(INVALID);
		expect(broken((backup) => (backup.entries[0].comments[0].memberId = 'x'))).toEqual(INVALID);
	});

	it('refuses two current members with one name, and a group without anyone', () => {
		expect(broken((backup) => (backup.members[1].name = 'anna'))).toEqual(INVALID);
		expect(broken((backup) => (backup.members = []))).toEqual(INVALID);
	});

	it('refuses other nonsense', () => {
		expect(broken((backup) => (backup.entries[0].amountCents = -1))).toEqual(INVALID);
		expect(broken((backup) => (backup.entries[0].date = 'soon'))).toEqual(INVALID);
		expect(broken((backup) => (backup.entries[0].category = 'x'))).toEqual(INVALID);
		expect(broken((backup) => (backup.group.kind = 'x'))).toEqual(INVALID);
	});

	it('keeps only what it knows', () => {
		const result = parseBackup(JSON.stringify({ ...valid(), personId: 'secret' }));
		expect(JSON.stringify(result)).not.toContain('secret');
	});
});
