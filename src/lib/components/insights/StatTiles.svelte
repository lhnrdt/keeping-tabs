<script lang="ts">
	// The headline numbers (#161), chosen per group type (sections.ts): single numbers as
	// tiles, not charts. A change is a signed number with an arrow and words, not color alone.
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Insights } from '#lib/insights/insights.ts';
	import type { Tile } from '#lib/insights/sections.ts';

	type Props = { insights: Insights; currency: string; tiles: readonly Tile[] };

	let { insights, currency, tiles }: Props = $props();

	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const percent = new Intl.NumberFormat(getLocale(), {
		style: 'percent',
		maximumFractionDigits: 0,
		signDisplay: 'exceptZero'
	});

	function changeText() {
		const change = insights.change;
		if (!change || change.previous === 0) return null;
		const ratio = (change.current - change.previous) / change.previous;
		const arrow = ratio > 0 ? '↑' : ratio < 0 ? '↓' : '→';
		return `${arrow} ${percent.format(ratio)}`;
	}

	function tile(id: Tile) {
		switch (id) {
			case 'spent':
				return { label: m.insights_total(), value: money(insights.total) };
			case 'myShare':
				return insights.myShare === null
					? null
					: { label: m.insights_my_share(), value: money(insights.myShare) };
			case 'perPerson':
				return { label: m.insights_per_person(), value: money(insights.perPerson) };
			case 'perDay':
				return { label: m.insights_per_day(), value: money(insights.perDay) };
			case 'fixedPerMonth':
				return insights.fixedPerMonth > 0
					? { label: m.insights_fixed_per_month(), value: money(insights.fixedPerMonth) }
					: null;
			case 'count':
				return { label: m.insights_expenses(), value: String(insights.count) };
			case 'change': {
				const text = changeText();
				const unit =
					insights.overTime.unit === 'month'
						? m.insights_vs_last_month()
						: m.insights_vs_last_week();
				return text ? { label: unit, value: text } : null;
			}
		}
	}

	// Tiles without a value here (e.g. no change yet) make room for the next in line
	const shown = $derived(tiles.map(tile).filter((entry) => entry !== null));
</script>

<dl class="mx-4 grid grid-cols-2 gap-3">
	{#each shown as entry, i (i)}
		<div class="rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
			<dt class="text-sm text-muted">{entry.label}</dt>
			<dd class="mt-1 text-xl font-semibold">{entry.value}</dd>
		</div>
	{/each}
</dl>
