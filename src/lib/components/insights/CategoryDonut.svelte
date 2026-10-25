<script lang="ts">
	// Categories by month (#183): a donut of one month's spending, the month's total in the
	// middle, a month selector below and a list that names each slice with its amount, so
	// colour never carries it alone. Categories keep their colour in every month.
	import { PieChart } from 'layerchart';
	import Icon from '#lib/components/Icon.svelte';
	import { categoryIcons, categoryLabels } from '#lib/expense/category-style.ts';
	import type { ExpenseCategory } from '#lib/expense/categories.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { MonthCategories, MonthSlice } from '#lib/insights/monthly.ts';

	type Props = { series: ExpenseCategory[]; months: MonthCategories[]; currency: string };

	let { series, months, currency }: Props = $props();

	// The latest month first; the selector steps back from there
	let index = $state(Number.MAX_SAFE_INTEGER);
	const at = $derived(Math.min(index, months.length - 1));
	const month = $derived(months[at]);

	const domain = $derived([...series, 'rest']);
	const colors = $derived([...series.map((_, i) => `var(--chart-${i + 1})`), 'var(--chart-rest)']);
	const colorOf = (category: MonthSlice['category']) => colors[domain.indexOf(category)];

	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const percent = (share: number) =>
		new Intl.NumberFormat(getLocale(), { style: 'percent', maximumFractionDigits: 0 }).format(
			share
		);
	const monthName = (iso: string) =>
		new Intl.DateTimeFormat(getLocale(), {
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(new Date(`${iso}T00:00:00Z`));
	const labelOf = (category: MonthSlice['category']) =>
		category === 'rest' ? m.insights_rest() : categoryLabels[category]();
</script>

<section
	aria-label={m.insights_month_categories()}
	class="mx-4 rounded-2xl bg-surface px-4 pt-4 pb-3 dark:bg-surface-night"
>
	<div class="relative mx-auto h-48 w-48">
		{#if month.total > 0}
			<PieChart
				data={month.slices}
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
		{:else}
			<div
				class="h-full w-full rounded-full border-[22px] border-surface-muted dark:border-surface-muted-night"
			></div>
		{/if}
		<div class="pointer-events-none absolute inset-0 grid place-content-center text-center">
			<span class="text-xs text-muted">{m.insights_total()}</span>
			<span class="font-semibold tabular-nums">{money(month.total)}</span>
		</div>
	</div>

	<!-- The month: step back and forth -->
	<div class="mt-3 flex items-center justify-between gap-2">
		<button
			type="button"
			class="grid h-10 w-10 place-items-center rounded-full bg-surface-muted disabled:opacity-40 dark:bg-surface-muted-night"
			onclick={() => (index = at - 1)}
			disabled={at === 0}
			aria-label={m.month_previous()}
		>
			<Icon name="previous" size={20} />
		</button>
		<p class="text-center font-medium" aria-live="polite">
			{monthName(month.month)}
		</p>
		<button
			type="button"
			class="grid h-10 w-10 place-items-center rounded-full bg-surface-muted disabled:opacity-40 dark:bg-surface-muted-night"
			onclick={() => (index = at + 1)}
			disabled={at === months.length - 1}
			aria-label={m.month_next()}
		>
			<Icon name="next" size={20} />
		</button>
	</div>

	{#if month.total > 0}
		<ul class="mt-3 space-y-2" aria-label={m.insights_month_categories()}>
			{#each month.slices as slice (slice.category)}
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
						<span class="text-muted"> · {percent(slice.amount / month.total)}</span>
					</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mt-3 text-center text-sm text-muted">{m.month_nothing()}</p>
	{/if}
</section>
