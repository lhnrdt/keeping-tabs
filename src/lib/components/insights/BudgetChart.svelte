<script lang="ts">
	// Budget and pace (#168, #188): spent so far as steps that add up (LayerChart), the budget
	// as a reference line, and a dashed projection to the end date (in the negative tone when
	// it goes over). A hidden table for screen readers.
	import { Area, AreaChart, Spline, Tooltip } from 'layerchart';
	import { curveStepAfter } from 'd3-shape';
	import { formatAmount, formatCompact } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { BudgetView } from '#lib/insights/budget.ts';

	let { view, currency }: { view: BudgetView; currency: string } = $props();

	const day = (iso: string) => new Date(`${iso}T00:00:00Z`);
	// From nothing at the start, each day's total, held until today (or the end)
	const spent = $derived([
		{ day: day(view.from), value: 0 },
		...view.points.map((point) => ({ day: day(point.date), value: point.spent })),
		{ day: day(view.upTo), value: view.spent }
	]);
	const projection = $derived(
		view.projected !== null && view.endsOn
			? [
					{ day: day(view.upTo), value: view.spent },
					{ day: day(view.endsOn), value: view.projected }
				]
			: []
	);
	const end = $derived(day(view.endsOn && view.endsOn > view.upTo ? view.endsOn : view.upTo));
	const top = $derived(Math.max(1, view.budget ?? 0, view.projected ?? 0, view.spent));
	const over = $derived(
		view.budget !== null && Math.max(view.spent, view.projected ?? 0) > view.budget
	);

	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const date = (value: Date) =>
		new Intl.DateTimeFormat(getLocale(), {
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC'
		}).format(value);
</script>

<div class="h-40" role="img" aria-label={m.insights_budget()}>
	<AreaChart
		data={spent}
		x="day"
		y="value"
		xDomain={[day(view.from), end]}
		yDomain={[0, top]}
		yNice
		grid={{ x: false }}
		props={{
			xAxis: { ticks: 3, format: date },
			yAxis: { ticks: 3, format: (value: number) => formatCompact(value, currency, getLocale()) },
			highlight: { area: false, lines: true, points: false },
			tooltip: { context: { mode: 'bisect-x', findTooltipData: 'left' } }
		}}
		annotations={view.budget === null
			? []
			: [
					{
						type: 'line',
						y: view.budget,
						label: m.budget_line({ amount: money(view.budget) }),
						// At the start, where spending is lowest, so the line leaves it free
						labelPlacement: 'top-left',
						labelYOffset: 2,
						props: {
							line: { class: 'stroke-ink/40 dark:stroke-ink-night/40' },
							label: { class: 'fill-ink-muted text-[10px] dark:fill-ink-muted-night' }
						}
					}
				]}
		padding={{ left: 40, bottom: 20, top: 8, right: 4 }}
	>
		{#snippet marks()}
			<Area curve={curveStepAfter} class="fill-accent/15 dark:fill-accent-night/20" />
			<Spline curve={curveStepAfter} class="stroke-accent stroke-2 dark:stroke-accent-night" />
			{#if projection.length}
				<Spline
					data={projection}
					class="stroke-2 [stroke-dasharray:4_4] {over
						? 'stroke-negative dark:stroke-negative-night'
						: 'stroke-ink/50 dark:stroke-ink-night/50'}"
				/>
			{/if}
		{/snippet}
		{#snippet tooltip()}
			<Tooltip.Root>
				{#snippet children({ data: point })}
					<Tooltip.Header>{date(point.day)}</Tooltip.Header>
					<Tooltip.List>
						<Tooltip.Item label={m.insights_total()} value={money(point.value)} />
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</AreaChart>
</div>
<table class="sr-only">
	<caption>{m.insights_budget()}</caption>
	<tbody>
		{#each view.points as point (point.date)}
			<tr><th scope="row">{date(day(point.date))}</th><td>{money(point.spent)}</td></tr>
		{/each}
	</tbody>
</table>
