import { describe, expect, it } from 'vitest';
import {
	bumpFor,
	isValidPrTitle,
	latestRelease,
	nextVersion,
	releaseCandidate
} from './versioning.ts';

describe('isValidPrTitle', () => {
	it('accepts conventional titles', () => {
		for (const title of ['feat: Add expenses', 'fix(balances): Round down', 'ci!: Drop Node 22']) {
			expect(isValidPrTitle(title)).toBe(true);
		}
	});

	it('rejects anything else', () => {
		for (const title of [
			'Add expenses',
			'feature: x',
			'feat:x',
			'feat(Bad Scope): x',
			'release: v1.0.0'
		]) {
			expect(isValidPrTitle(title)).toBe(false);
		}
	});
});

describe('bumpFor', () => {
	it('maps types to bumps', () => {
		expect(bumpFor('feat: x')).toBe('minor');
		expect(bumpFor('fix: x')).toBe('patch');
		expect(bumpFor('chore: x')).toBe('patch');
		expect(bumpFor('fix!: x')).toBe('major');
	});
});

describe('nextVersion', () => {
	it('uses the biggest bump among the PRs', () => {
		expect(nextVersion('0.2.3', ['fix: a', 'feat: b', 'docs: c'])).toBe('0.3.0');
		expect(nextVersion('0.2.3', ['fix: a', 'chore: b'])).toBe('0.2.4');
		expect(nextVersion('1.2.3', ['feat!: a'])).toBe('2.0.0');
	});

	it('keeps MAJOR at 0 before 1.0', () => {
		expect(nextVersion('0.9.1', ['feat!: a'])).toBe('0.10.0');
	});

	it('returns null when nothing was merged', () => {
		expect(nextVersion('0.2.3', [])).toBeNull();
	});
});

describe('releaseCandidate', () => {
	it('counts the PRs since the last release', () => {
		expect(releaseCandidate('0.0.0', ['feat: a', 'fix: b'])).toBe('0.1.0-rc.2');
	});
});

describe('latestRelease', () => {
	it('picks the highest release tag by number', () => {
		expect(latestRelease(['v0.9.0', 'v0.10.0', 'v0.10.1-rc.1', 'nightly'])).toBe('0.10.0');
	});

	it('starts at 0.0.0', () => {
		expect(latestRelease([])).toBe('0.0.0');
	});
});
