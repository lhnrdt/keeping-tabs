// Each kind of cost's name and what it means (#167), for the kinds chart and the month stack.
import { m } from '#lib/paraglide/messages.js';
import type { Kind } from '#lib/insights/expense-kinds.ts';

export const kindLabels: Record<Kind, () => string> = {
	fixed: m.kind_fixed,
	everyday: m.kind_everyday,
	occasional: m.kind_occasional,
	big: m.kind_big
};

export const kindHints: Record<Kind, () => string> = {
	fixed: m.kind_fixed_hint,
	everyday: m.kind_everyday_hint,
	occasional: m.kind_occasional_hint,
	big: m.kind_big_hint
};
