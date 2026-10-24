<script lang="ts">
	// Spending over time (#161): one column per day, week or month in the theme's accent, from
	// one baseline. Tap or hover a column for its value; the table below is for screen readers.
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Bucket, Unit } from '#lib/insights/insights.ts';

	type Props = { unit: Unit; buckets: Bucket[]; currency: string };

	let { unit, buckets, currency }: Props = $props();

	const WIDTH = 320;
	const HEIGHT = 140;
	const AXIS = 22;
	const MAX_BAR = 24;

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

	const max = $derived(Math.max(1, ...buckets.map((bucket) => bucket.amount)));
	const slot = $derived(WIDTH / Math.max(1, buckets.length));
	const barWidth = $derived(Math.max(2, Math.min(MAX_BAR, slot * 0.6)));
	const heightOf = (amount: number) => (amount / max) * (HEIGHT - 8);

	/** A column with a rounded top, square at the baseline */
	function columnPath(i: number, amount: number) {
		const h = heightOf(amount);
		if (h <= 0) return '';
		const x = i * slot + (slot - barWidth) / 2;
		const r = Math.min(4, barWidth / 2, h);
		const top = HEIGHT - h;
		return `M${x} ${HEIGHT}V${top + r}q0 ${-r} ${r} ${-r}h${barWidth - 2 * r}q${r} 0 ${r} ${r}V${HEIGHT}z`;
	}

	/** First, middle and last labels: enough to read the span without crowding */
	const labelled = $derived(
		[...new Set([0, Math.floor((buckets.length - 1) / 2), buckets.length - 1])].filter(
			(i) => i >= 0
		)
	);
	let selected = $state<number | null>(null);
	const caption = $derived(
		selected === null
			? m.insights_tap_hint()
			: `${dateLabel(buckets[selected].start)}: ${money(buckets[selected].amount)}`
	);
</script>

<figure class="mx-4 rounded-2xl bg-surface px-4 pt-3 pb-2 dark:bg-surface-night">
	<figcaption class="mb-2 text-sm text-muted" aria-live="polite">{caption}</figcaption>
	<svg
		viewBox="0 0 {WIDTH} {HEIGHT + AXIS}"
		class="w-full overflow-visible"
		role="img"
		aria-label={m.insights_over_time()}
	>
		<!-- Recessive top and baseline -->
		<line
			x1="0"
			x2={WIDTH}
			y1="8"
			y2="8"
			class="stroke-ink/10 dark:stroke-ink-night/10"
			stroke-width="1"
		/>
		<line
			x1="0"
			x2={WIDTH}
			y1={HEIGHT}
			y2={HEIGHT}
			class="stroke-ink/20 dark:stroke-ink-night/20"
			stroke-width="1"
		/>
		<text
			x={WIDTH}
			y="4"
			text-anchor="end"
			class="fill-ink-muted text-[9px] dark:fill-ink-muted-night">{money(max)}</text
		>
		{#each buckets as bucket, i (bucket.start)}
			<path
				d={columnPath(i, bucket.amount)}
				class="fill-accent dark:fill-accent-night {selected !== null && selected !== i
					? 'opacity-50'
					: ''}"
			/>
			<!-- A hit target taller and wider than the column -->
			<rect
				x={i * slot}
				y="0"
				width={slot}
				height={HEIGHT}
				fill="transparent"
				role="presentation"
				onpointerenter={(event) => {
					if (event.pointerType === 'mouse') selected = i;
				}}
				onpointerleave={(event) => {
					if (event.pointerType === 'mouse') selected = null;
				}}
				onclick={(event) => {
					// A tap selects; tapping it again (not a mouse hover's click) clears
					const mouse = 'pointerType' in event && event.pointerType === 'mouse';
					selected = !mouse && selected === i ? null : i;
				}}
			/>
		{/each}
		{#each labelled as i (i)}
			<text
				x={i * slot + slot / 2}
				y={HEIGHT + 15}
				text-anchor={i === 0 ? 'start' : i === buckets.length - 1 ? 'end' : 'middle'}
				class="fill-ink-muted text-[10px] dark:fill-ink-muted-night"
			>
				{dateLabel(buckets[i].start)}
			</text>
		{/each}
	</svg>
	<table class="sr-only">
		<caption>{m.insights_over_time()}</caption>
		<tbody>
			{#each buckets as row (row.start)}
				<tr><th scope="row">{dateLabel(row.start)}</th><td>{money(row.amount)}</td></tr>
			{/each}
		</tbody>
	</table>
</figure>
