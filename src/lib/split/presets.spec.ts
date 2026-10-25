import { describe, expect, it } from 'vitest';
import { presetOf, presetValues } from './presets';

const pair = { me: 'anna', other: 'ben' };

describe('two-person presets', () => {
	it('sets the payer and who takes part', () => {
		expect(presetValues('iSplit', pair)).toEqual({ paidBy: 'anna', participants: ['anna', 'ben'] });
		expect(presetValues('iFull', pair)).toEqual({ paidBy: 'anna', participants: ['ben'] });
		expect(presetValues('theyFull', pair)).toEqual({ paidBy: 'ben', participants: ['anna'] });
	});

	it('recognises an expense as one of them', () => {
		const equal = { splitMode: 'equal' };
		expect(presetOf({ ...equal, paidBy: 'ben', participants: ['ben', 'anna'] }, pair)).toBe(
			'theySplit'
		);
		expect(presetOf({ ...equal, paidBy: 'anna', participants: ['ben'] }, pair)).toBe('iFull');
		// A new expense: no payer yet, everyone takes part
		expect(presetOf({ splitMode: '', paidBy: '', participants: ['anna', 'ben'] }, pair)).toBe(
			'iSplit'
		);
	});

	it('leaves anything else to the full form', () => {
		expect(presetOf({ splitMode: 'percent', paidBy: 'anna', participants: [] }, pair)).toBeNull();
		expect(
			presetOf({ splitMode: 'equal', paidBy: 'anna', participants: ['anna'] }, pair)
		).toBeNull();
	});
});
