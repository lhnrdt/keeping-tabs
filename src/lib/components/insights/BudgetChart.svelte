<script lang="ts">
	// Budget and pace (#168): spent so far as a line that adds up, the budget as a reference
	// line, and a dashed projection to the end date (in the negative tone when it goes over).
	// A hidden table for screen readers.
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { BudgetView } from '#lib/insights/budget.ts';

	let { view, currency }: { view: BudgetView; currency: string } = $props();

	const W = 320;
	const H = 120;
	const AXIS = 18;

	const time = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();
	const start = $derived(view.from);
	const upTo = $derived(view.upTo);
	const end = $derived(view.endsOn && view.endsOn > upTo ? view.endsOn : upTo);
	const span = $derived(Math.max(1, time(end) - time(start)));
	const top = $derived(Math.max(1, view.budget ?? 0, view.projected ?? 0, view.spent) * 1.08);
	const x = (iso: string) => ((time(iso) - time(start)) / span) * W;
	const y = (amount: number) => H - (amount / top) * H;

	const line = $derived(
		[
			`M0 ${H}`,
			...view.points.map((point) => `H${x(point.date)}V${y(point.spent)}`),
			`H${x(upTo)}`
		].join('')
	);
	const over = $derived(
		view.budget !== null && Math.max(view.spent, view.projected ?? 0) > view.budget
	);
	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const date = (iso: string) =>
		new Intl.DateTimeFormat(getLocale(), {
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC'
		}).format(new Date(`${iso}T00:00:00Z`));
</script>

<svg
	viewBox="0 0 {W} {H + AXIS}"
	class="w-full overflow-visible"
	role="img"
	aria-label={m.insights_budget()}
>
	<line x1="0" x2={W} y1={H} y2={H} class="stroke-ink/20 dark:stroke-ink-night/20" />
	<g class="text-accent dark:text-accent-night">
		<path d="{line}V{H}Z" fill="currentColor" opacity="0.12" />
		<path d={line} fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
	</g>
	{#if view.projected !== null && view.endsOn}
		<line
			x1={x(upTo)}
			y1={y(view.spent)}
			x2={x(view.endsOn)}
			y2={y(view.projected)}
			stroke-width="2"
			stroke-dasharray="4 4"
			stroke-linecap="round"
			class={over
				? 'stroke-negative dark:stroke-negative-night'
				: 'stroke-ink/50 dark:stroke-ink-night/50'}
		/>
	{/if}
	{#if view.budget !== null}
		<line
			x1="0"
			x2={W}
			y1={y(view.budget)}
			y2={y(view.budget)}
			stroke-width="1"
			class="stroke-ink/40 dark:stroke-ink-night/40"
		/>
		<!-- At the start, where spending is lowest, so the lines leave it free -->
		<text x="0" y={y(view.budget) - 4} class="fill-ink-muted text-[9px] dark:fill-ink-muted-night"
			>{m.budget_line({ amount: money(view.budget) })}</text
		>
	{/if}
	<text x="0" y={H + 13} class="fill-ink-muted text-[10px] dark:fill-ink-muted-night"
		>{date(start)}</text
	>
	<text
		x={W}
		y={H + 13}
		text-anchor="end"
		class="fill-ink-muted text-[10px] dark:fill-ink-muted-night">{date(end)}</text
	>
</svg>
<table class="sr-only">
	<caption>{m.insights_budget()}</caption>
	<tbody>
		{#each view.points as point (point.date)}
			<tr><th scope="row">{date(point.date)}</th><td>{money(point.spent)}</td></tr>
		{/each}
	</tbody>
</table>
