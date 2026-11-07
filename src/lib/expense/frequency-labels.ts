// How often something repeats, in words (#45), for the form and the list of repeating expenses.
import { m } from '#lib/paraglide/messages.js';
import type { Frequency } from './recurrence';

export const frequencyLabels: Record<Frequency, () => string> = {
	weekly: m.repeats_weekly,
	monthly: m.repeats_monthly,
	quarterly: m.repeats_quarterly,
	halfYearly: m.repeats_half_yearly,
	yearly: m.repeats_yearly
};
