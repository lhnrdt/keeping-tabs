import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cueMoment, takeMoment } from './moments';

describe('everyday moments (#291)', () => {
	beforeEach(() => {
		const items = new Map<string, string>();
		vi.stubGlobal('sessionStorage', {
			getItem: (key: string) => items.get(key) ?? null,
			setItem: (key: string, value: string) => void items.set(key, value),
			removeItem: (key: string) => void items.delete(key)
		});
	});

	it('is answered once, where it lands', () => {
		cueMoment({ kind: 'added', id: 'e1' });
		expect(takeMoment()).toEqual({ kind: 'added', id: 'e1' });
		expect(takeMoment()).toBeNull();
	});

	it('is nothing without storage', () => {
		vi.stubGlobal('sessionStorage', {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			},
			removeItem: () => {}
		});
		expect(() => cueMoment({ kind: 'paid' })).not.toThrow();
		expect(takeMoment()).toBeNull();
	});
});
