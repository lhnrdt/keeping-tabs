import { describe, expect, it } from 'vitest';
import { CHANGELOG } from './entries';
import { compareVersions, visibleEntries } from './visible';

describe('changelog', () => {
	it('compares versions by number, a test build like its version', () => {
		expect(compareVersions('0.9.0', '0.13.0')).toBe(-1);
		expect(compareVersions('0.14.0', '0.14.0-rc.2')).toBe(0);
		expect(compareVersions('1.0.0', '0.14.0')).toBe(1);
	});

	it('shows only versions that are out, the coming one on its test build', () => {
		const shown = (version: string) =>
			visibleEntries(CHANGELOG, version).map((entry) => entry.version);
		expect(shown('0.13.0')[0]).toBe('0.13.0');
		expect(shown('0.14.0-rc.1')[0]).toBe('0.14.0');
		expect(shown('0.0.0-dev')).toHaveLength(CHANGELOG.length);
	});

	it('has every line in English and German, newest version first', () => {
		for (const entry of CHANGELOG) {
			for (const item of entry.items) expect(item.en && item.de).toBeTruthy();
		}
		const versions = CHANGELOG.map((entry) => entry.version);
		expect(versions.toSorted((a, b) => compareVersions(b, a))).toEqual(versions);
	});
});
