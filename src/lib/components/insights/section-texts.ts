// Each insight section's title and one-line description (#174), for the tab and the chooser.
import { m } from '#lib/paraglide/messages.js';
import type { Section } from '#lib/insights/sections.ts';

export const sectionTitles: Record<Section, () => string> = {
	recap: m.insights_recap,
	budget: m.insights_budget,
	highlights: m.insights_highlights,
	overTime: m.insights_over_time,
	categories: m.insights_by_category,
	kinds: m.insights_kinds,
	kindMonths: m.insights_kind_months,
	fixedCosts: m.insights_fixed,
	biggest: m.insights_biggest,
	places: m.insights_places,
	whoPays: m.insights_who_pays,
	howOften: m.insights_how_often,
	myPosition: m.insights_position,
	settling: m.insights_settling
};

export const sectionHints: Record<Section, () => string> = {
	recap: m.section_recap_hint,
	budget: m.section_budget_hint,
	highlights: m.section_highlights_hint,
	overTime: m.section_over_time_hint,
	categories: m.section_categories_hint,
	kinds: m.section_kinds_hint,
	kindMonths: m.section_kind_months_hint,
	fixedCosts: m.section_fixed_hint,
	biggest: m.section_biggest_hint,
	places: m.section_places_hint,
	whoPays: m.section_who_pays_hint,
	howOften: m.section_how_often_hint,
	myPosition: m.section_position_hint,
	settling: m.section_settling_hint
};
