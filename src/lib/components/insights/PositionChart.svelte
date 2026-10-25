<script lang="ts">
	// Your position over time (#166, #188): your balance after each day, as steps around zero
	// (LayerChart): above it (owed to you) in the positive tone, below (you owe) in the
	// negative one. Tap or hover for a day; a hidden table for screen readers.
	import { Area, AreaChart, Spline, Threshold, Tooltip } from 'layerchart';
	import { curveStepAfter } from 'd3-shape';
	import { formatAmount, formatCompact } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Point } from '#lib/insights/standing.ts';

	let { points, currency }: { points: Point[]; currency: string } = $props();

	// Dates for the time axis, and zero for the threshold to fill against
	const data = $derived(
		points.map((point) => ({ ...point, day: new Date(`${point.date}T00:00:00Z`), zero: 0 }))
	);
	// Zero always in view, as the line between owed and owing
	const low = $derived(Math.min(0, ...points.map((point) => point.balance)));
	const high = $derived(Math.max(0, ...points.map((point) => point.balance)));

	const money = (amount: number) => formatAmount(Math.abs(amount), currency, getLocale());
	const date = (day: Date) =>
		new Intl.DateTimeFormat(getLocale(), {
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC'
		}).format(day);
	const describe = (balance: number) =>
		balance > 0
			? m.position_owed({ amount: money(balance) })
			: balance < 0
				? m.position_owing({ amount: money(balance) })
				: m.position_even();
</script>

<figure class="mx-4 rounded-2xl bg-surface px-4 pt-3 pb-2 dark:bg-surface-night">
	<figcaption class="mb-2 text-sm">
		<span class="text-muted">{date(data.at(-1)!.day)}:</span>
		<span
			class={points.at(-1)!.balance > 0
				? 'tone-positive'
				: points.at(-1)!.balance < 0
					? 'tone-negative'
					: 'text-muted'}
		>
			{describe(points.at(-1)!.balance)}
		</span>
	</figcaption>
	<div class="h-40" role="img" aria-label={m.insights_position()}>
		<AreaChart
			{data}
			x="day"
			y={['balance', 'zero']}
			yDomain={[low, high]}
			yNice
			grid={{ x: false }}
			props={{
				xAxis: { ticks: 3, format: date },
				yAxis: { ticks: 3, format: (value: number) => formatCompact(value, currency, getLocale()) },
				highlight: { area: false, lines: true, points: false },
				tooltip: { context: { mode: 'bisect-x', findTooltipData: 'left' } }
			}}
			padding={{ left: 40, bottom: 20, top: 8, right: 4 }}
		>
			{#snippet marks()}
				<Threshold curve={curveStepAfter}>
					{#snippet above({ curve })}
						<Area
							y0="balance"
							y1="zero"
							{curve}
							class="fill-positive/15 dark:fill-positive-night/20"
						/>
					{/snippet}
					{#snippet below({ curve })}
						<Area
							y0="balance"
							y1="zero"
							{curve}
							class="fill-negative/15 dark:fill-negative-night/20"
						/>
					{/snippet}
					{#snippet children({ curve })}
						<Spline y="zero" {curve} class="stroke-ink/25 dark:stroke-ink-night/25" />
						<Spline y="balance" {curve} class="stroke-ink stroke-2 dark:stroke-ink-night" />
					{/snippet}
				</Threshold>
			{/snippet}
			{#snippet tooltip()}
				<Tooltip.Root>
					{#snippet children({ data: point })}
						<Tooltip.Header>{date(point.day)}</Tooltip.Header>
						<Tooltip.List>
							<Tooltip.Item label={describe(point.balance)} />
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</AreaChart>
	</div>
	<table class="sr-only">
		<caption>{m.insights_position()}</caption>
		<tbody>
			{#each data as point (point.date)}
				<tr><th scope="row">{date(point.day)}</th><td>{describe(point.balance)}</td></tr>
			{/each}
		</tbody>
	</table>
</figure>
