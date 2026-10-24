<script lang="ts">
	// Your position over time (#166): your balance after each day, around zero. Above zero
	// (owed to you) in the positive tone, below (you owe) in the negative one, as a 2px line
	// over a soft wash. Tap or hover for a day; a hidden table for screen readers.
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Point } from '#lib/insights/standing.ts';

	let { points, currency }: { points: Point[]; currency: string } = $props();

	const W = 320;
	const H = 120;
	const AXIS = 18;
	const id = $props.id();

	const time = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();
	const first = $derived(time(points[0].date));
	const span = $derived(Math.max(1, time(points.at(-1)!.date) - first));
	const reach = $derived(Math.max(1, ...points.map((point) => Math.abs(point.balance))));
	const x = (iso: string) => ((time(iso) - first) / span) * W;
	const y = (balance: number) => H / 2 - (balance / reach) * (H / 2 - 6);

	/** Steps: a balance holds until the next day with entries */
	const line = $derived(
		points
			.map((point, i) =>
				i === 0 ? `M${x(point.date)} ${y(point.balance)}` : `H${x(point.date)}V${y(point.balance)}`
			)
			.join('')
	);
	const area = $derived(`${line}H${W}V${H / 2}H0Z`);
	const money = (amount: number) => formatAmount(Math.abs(amount), currency, getLocale());
	const date = (iso: string) =>
		new Intl.DateTimeFormat(getLocale(), {
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC'
		}).format(new Date(`${iso}T00:00:00Z`));
	const describe = (point: Point) =>
		point.balance > 0
			? m.position_owed({ amount: money(point.balance) })
			: point.balance < 0
				? m.position_owing({ amount: money(point.balance) })
				: m.position_even();

	let selected = $state<number | null>(null);
	const shown = $derived(points[selected ?? points.length - 1]);

	function pick(event: PointerEvent) {
		const box = (event.currentTarget as SVGRectElement).getBoundingClientRect();
		const at = ((event.clientX - box.left) / box.width) * span + first;
		let nearest = 0;
		points.forEach((point, i) => {
			if (Math.abs(time(point.date) - at) < Math.abs(time(points[nearest].date) - at)) nearest = i;
		});
		selected = nearest;
	}
</script>

<figure class="mx-4 rounded-2xl bg-surface px-4 pt-3 pb-2 dark:bg-surface-night">
	<figcaption class="mb-2 text-sm" aria-live="polite">
		<span class="text-muted">{date(shown.date)}:</span>
		<span
			class={shown.balance > 0
				? 'tone-positive'
				: shown.balance < 0
					? 'tone-negative'
					: 'text-muted'}
		>
			{describe(shown)}
		</span>
	</figcaption>
	<svg
		viewBox="0 0 {W} {H + AXIS}"
		class="w-full overflow-visible"
		role="img"
		aria-label={m.insights_position()}
	>
		<defs>
			<clipPath id="{id}-above"><rect x="0" y="0" width={W} height={H / 2} /></clipPath>
			<clipPath id="{id}-below"><rect x="0" y={H / 2} width={W} height={H / 2} /></clipPath>
		</defs>
		<g clip-path="url(#{id}-above)" class="text-positive dark:text-positive-night">
			<path d={area} fill="currentColor" opacity="0.12" />
			<path d={line} fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
		</g>
		<g clip-path="url(#{id}-below)" class="text-negative dark:text-negative-night">
			<path d={area} fill="currentColor" opacity="0.12" />
			<path d={line} fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
		</g>
		<!-- Zero: even -->
		<line
			x1="0"
			x2={W}
			y1={H / 2}
			y2={H / 2}
			class="stroke-ink/25 dark:stroke-ink-night/25"
			stroke-width="1"
		/>
		{#if selected !== null}
			<circle
				cx={x(shown.date)}
				cy={y(shown.balance)}
				r="4"
				class="fill-ink stroke-surface dark:fill-ink-night dark:stroke-surface-night"
				stroke-width="2"
			/>
		{/if}
		<text x="0" y={H + 13} class="fill-ink-muted text-[10px] dark:fill-ink-muted-night"
			>{date(points[0].date)}</text
		>
		<text
			x={W}
			y={H + 13}
			text-anchor="end"
			class="fill-ink-muted text-[10px] dark:fill-ink-muted-night">{date(points.at(-1)!.date)}</text
		>
		<rect
			x="0"
			y="0"
			width={W}
			height={H}
			fill="transparent"
			role="presentation"
			onpointermove={pick}
			onpointerdown={pick}
			onpointerleave={(event) => {
				if (event.pointerType === 'mouse') selected = null;
			}}
		/>
	</svg>
	<table class="sr-only">
		<caption>{m.insights_position()}</caption>
		<tbody>
			{#each points as point (point.date)}
				<tr><th scope="row">{date(point.date)}</th><td>{describe(point)}</td></tr>
			{/each}
		</tbody>
	</table>
</figure>
