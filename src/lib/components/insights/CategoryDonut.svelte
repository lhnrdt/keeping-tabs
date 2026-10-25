<script lang="ts">
	// Spending by category (#183): a donut of the period with its total in the middle, and a
	// list naming each slice with its amount and share, so colour never carries it alone.
	// Categories keep their colour in every period.
	import { PieChart } from 'layerchart';
	import Icon from '#lib/components/Icon.svelte';
	import { categoryIcons, categoryLabels } from '#lib/expense/category-style.ts';
	import type { ExpenseCategory } from '#lib/expense/categories.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Slice } from '#lib/insights/category-slices.ts';

	type Props = { series: ExpenseCategory[]; slices: Slice[]; currency: string };

	let { series, slices, currency }: Props = $props();

	const total = $derived(slices.reduce((sum, slice) => sum + slice.amount, 0));
	const domain = $derived([...series, 'rest']);
	const colors = $derived([...series.map((_, i) => `var(--chart-${i + 1})`), 'var(--chart-rest)']);
	const colorOf = (category: Slice['category']) => colors[domain.indexOf(category)];

	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const percent = (share: number) =>
		new Intl.NumberFormat(getLocale(), { style: 'percent', maximumFractionDigits: 0 }).format(
			share
		);
	const labelOf = (category: Slice['category']) =>
		category === 'rest' ? m.insights_rest() : categoryLabels[category]();
</script>

<div class="mx-4 rounded-2xl bg-surface px-4 pt-4 pb-3 dark:bg-surface-night">
	<div class="relative mx-auto h-48 w-48" role="img" aria-label={m.insights_by_category()}>
		<PieChart
			data={slices}
			key="category"
			value="amount"
			c="category"
			cDomain={domain}
			cRange={colors}
			innerRadius={-22}
			padAngle={0.02}
			cornerRadius={4}
			height={192}
			tooltipContext={false}
		/>
		<div class="pointer-events-none absolute inset-0 grid place-content-center text-center">
			<span class="text-xs text-muted">{m.insights_total()}</span>
			<span class="font-semibold tabular-nums">{money(total)}</span>
		</div>
	</div>
	<ul class="mt-3 space-y-2" aria-label={m.insights_by_category()}>
		{#each slices as slice (slice.category)}
			<li class="flex items-center gap-3 text-sm">
				<span
					class="h-3 w-3 shrink-0 rounded-full"
					style:background-color={colorOf(slice.category)}
					aria-hidden="true"
				></span>
				<span class="text-muted" aria-hidden="true">
					<Icon
						name={slice.category === 'rest' ? 'expense' : categoryIcons[slice.category]}
						size={18}
					/>
				</span>
				<span class="min-w-0 flex-1 truncate">{labelOf(slice.category)}</span>
				<span class="tabular-nums">
					{money(slice.amount)}
					<span class="text-muted"> · {percent(slice.amount / total)}</span>
				</span>
			</li>
		{/each}
	</ul>
</div>
