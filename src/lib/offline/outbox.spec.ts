import { beforeEach, describe, expect, it, vi } from 'vitest';
import { keep, pendingFor, pendingId, type Pending } from './outbox';

const change = (over: Partial<Pending>): Pending => ({
	id: 'x',
	token: 'g',
	action: '/g/g/expenses/new?/save',
	fields: [],
	title: 'Bread',
	amount: '4',
	date: '2026-11-15',
	addedAt: 0,
	...over
});

describe('changes kept while offline (#55, #347)', () => {
	beforeEach(() => {
		const items = new Map<string, string>();
		vi.stubGlobal('localStorage', {
			getItem: (key: string) => items.get(key) ?? null,
			setItem: (key: string, value: string) => void items.set(key, value)
		});
	});

	it('keeps only the latest edit of an entry', () => {
		keep(change({ id: pendingId('edit', 'e1'), kind: 'edit', target: 'e1', title: 'Bread' }));
		keep(change({ id: pendingId('edit', 'e1'), kind: 'edit', target: 'e1', title: 'Brot' }));
		expect(pendingFor('g').map((item) => item.title)).toEqual(['Brot']);
	});

	it('forgets an expense that never reached the server when it’s deleted', () => {
		keep(change({ id: 'e2' }));
		keep(change({ id: pendingId('delete', 'e2'), kind: 'delete', target: 'e2' }));
		expect(pendingFor('g')).toEqual([]);
	});

	it('drops the edits waiting for an entry that’s deleted, and keeps the deletion', () => {
		keep(change({ id: pendingId('edit', 'e3'), kind: 'edit', target: 'e3' }));
		keep(change({ id: pendingId('delete', 'e3'), kind: 'delete', target: 'e3' }));
		expect(pendingFor('g').map((item) => item.kind)).toEqual(['delete']);
	});
});
