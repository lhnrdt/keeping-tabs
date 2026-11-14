import { describe, expect, it } from 'vitest';
import { onboardingOf, partsIn } from './onboarding';

describe('what of the onboarding someone has seen (#331)', () => {
	it('keeps only parts it knows the shape of', () => {
		expect(partsIn(['welcome', 'tip-swipe', 'Not a part', 3, '<x>'])).toEqual([
			'welcome',
			'tip-swipe'
		]);
		expect(partsIn('welcome')).toEqual([]);
	});

	it('reads what was kept, and nothing from what can’t be read', () => {
		expect(onboardingOf({ onboarding: '["home","none"]' })).toEqual(['home', 'none']);
		expect(onboardingOf({ onboarding: 'not json' })).toEqual([]);
		expect(onboardingOf({ onboarding: null })).toEqual([]);
		expect(onboardingOf(undefined)).toEqual([]);
	});
});
