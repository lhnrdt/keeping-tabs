<script lang="ts">
	// Spending over time (#161, #188): one column per day, week or month in the theme's accent
	// (LayerChart), first, middle and last dates on the axis, the amount on hover or tap. Big
	// one-offs can be left out (#167). The table below is for screen readers.
	import { BarChart, Tooltip } from 'layerchart';
	import { formatAmount, formatCompact } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Bucket, Unit } from '#lib/insights/insights.ts';

	type Props = {
		unit: Unit;
		buckets: Bucket[];
		/** The same without big one-offs, offered as a toggle when there are any (#167) */
		withoutBig?: Bucket[] | null;
		currency: string;
	};

	let { unit, buckets: all, withoutBig = null, currency }: Props = $props();

	let leaveOutBig = $state(false);
	const buckets = $derived(leaveOutBig && withoutBig ? withoutBig : all);

	const formats: Record<Unit, Intl.DateTimeFormatOptions> = {
		day: { day: 'numeric', month: 'short' },
		week: { day: 'numeric', month: 'short' },
		month: { month: 'short', year: '2-digit' }
	};
	const dateLabel = (iso: string) =>
		new Intl.DateTimeFormat(getLocale(), { ...formats[unit], timeZone: 'UTC' }).format(
			new Date(`${iso}T00:00:00Z`)
		);
	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const compact = (amount: number) => formatCompact(amount, currency, getLocale());

	/** First, middle and last labels: enough to read the span without crowding */
	const ticks = $derived(
		[...new Set([0, Math.floor((buckets.length - 1) / 2), buckets.length - 1])]
			.filter((i) => i >= 0)
			.map((i) => buckets[i].start)
	);
</script>

<figure class="mx-4 rounded-2xl bg-surface px-4 pt-3 pb-2 dark:bg-surface-night">
	<figcaption class="mb-2 flex items-center justify-between gap-2">
		<span class="text-sm text-muted">{m.insights_tap_hint()}</span>
		{#if withoutBig}
			<button
				type="button"
				aria-pressed={leaveOutBig}
				class="shrink-0 rounded-full px-3 py-1 text-xs font-medium {leaveOutBig
					? 'bg-accent text-surface dark:bg-accent-night dark:text-canvas-night'
					: 'bg-surface-muted text-ink dark:bg-surface-muted-night dark:text-ink-night'}"
				onclick={() => (leaveOutBig = !leaveOutBig)}
			>
				{m.insights_without_big()}
			</button>
		{/if}
	</figcaption>
	<div class="h-44" role="img" aria-label={m.insights_over_time()}>
		<BarChart
			data={buckets}
			x="start"
			y="amount"
			bandPadding={0.3}
			grid={{ x: false }}
			props={{
				xAxis: { ticks, format: dateLabel },
				yAxis: { format: compact, ticks: 3 },
				bars: { strokeWidth: 0 }
			}}
			padding={{ left: 40, bottom: 20, top: 8 }}
		>
			{#snippet tooltip()}
				<Tooltip.Root>
					{#snippet children({ data })}
						<Tooltip.Header>{dateLabel(data.start)}</Tooltip.Header>
						<Tooltip.List>
							<Tooltip.Item label={m.insights_total()} value={money(data.amount)} />
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</BarChart>
	</div>
	<table class="sr-only">
		<caption>{m.insights_over_time()}</caption>
		<tbody>
			{#each buckets as row (row.start)}
				<tr><th scope="row">{dateLabel(row.start)}</th><td>{money(row.amount)}</td></tr>
			{/each}
		</tbody>
	</table>
</figure>
