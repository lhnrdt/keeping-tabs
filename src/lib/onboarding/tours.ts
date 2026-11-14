// The onboarding's tours (#331): the real screens, one control at a time. Where a step says "Tap",
// tapping the control itself goes on, and the next step waits for what it opens.
import type { DriveStep } from 'driver.js';
import { m } from '#lib/paraglide/messages.js';

export type TourName = 'home' | 'group' | 'expense';

const at = (tour: string) => `[data-tour="${tour}"]`;
const step = (element: string, title: string, description: string): DriveStep => ({
	element: at(element),
	popover: { title, description }
});
/** Go on by tapping the control, which is what the step asks */
const tap = (element: string, title: string, description: string): DriveStep => ({
	...step(element, title, description),
	advanceOn: 'click',
	popover: { title, description, showButtons: ['close'] }
});

export const TOURS: Record<TourName, () => DriveStep[]> = {
	home: () => [
		// Only while it can be installed: the card isn't there otherwise, and the step is skipped
		step('install', m.onboarding_install_title(), m.onboarding_install_text()),
		step('new-group', m.onboarding_new_group_title(), m.onboarding_new_group_text()),
		step('profile', m.onboarding_profile_title(), m.onboarding_profile_text()),
		step('how-it-works', m.onboarding_how_title(), m.onboarding_how_text())
	],
	group: () => [
		step('group-hero', m.onboarding_hero_title(), m.onboarding_hero_text()),
		step('add-expense', m.onboarding_add_title(), m.onboarding_add_text()),
		tap(
			'tab-balances',
			m.onboarding_tab_balances_title(),
			m.onboarding_tab_balances_text({ tab: m.tab_balances() })
		),
		step('balances', m.onboarding_balances_title(), m.onboarding_balances_text()),
		tap(
			'tab-group',
			m.onboarding_tab_group_title(),
			m.onboarding_tab_group_text({ tab: m.tab_group() })
		),
		step('share', m.onboarding_share_title(), m.onboarding_share_text())
	],
	expense: () => [
		step('expense-what', m.onboarding_what_title(), m.onboarding_what_text()),
		step('expense-amount', m.onboarding_amount_title(), m.onboarding_amount_text()),
		step('expense-paid-by', m.onboarding_paid_by_title(), m.onboarding_paid_by_text()),
		step('expense-split', m.onboarding_split_title(), m.onboarding_split_text()),
		step('expense-for', m.onboarding_for_title(), m.onboarding_for_text())
	]
};

/** Before the first tour someone meets, wherever that is */
export const welcome = (onDecline: () => void): DriveStep => ({
	popover: {
		title: m.onboarding_welcome_title(),
		description: m.onboarding_welcome_text(),
		showButtons: ['next', 'previous'],
		disableButtons: [],
		showProgress: false,
		nextBtnText: m.onboarding_show_me(),
		prevBtnText: m.onboarding_not_now(),
		onPrevClick: onDecline
	}
});
