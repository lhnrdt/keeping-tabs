import { describe, expect, it } from 'vitest';
import { DELETED_GROUP_DAYS, isRestorable, restorableUntil } from './retention';

const deleted = new Date('2026-10-01T12:00:00Z');

describe('retention of deleted groups', () => {
	it('can be restored until the retention period is over', () => {
		expect(restorableUntil(deleted).toISOString()).toBe('2026-10-31T12:00:00.000Z');
		expect(isRestorable(deleted, new Date('2026-10-31T11:59:59Z'))).toBe(true);
		expect(isRestorable(deleted, new Date('2026-10-31T12:00:01Z'))).toBe(false);
	});

	it('keeps groups for 30 days', () => {
		expect(DELETED_GROUP_DAYS).toBe(30);
	});
});
