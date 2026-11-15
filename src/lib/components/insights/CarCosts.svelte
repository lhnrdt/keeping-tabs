<script lang="ts">
	// What the car costs over time (#366): per km month by month, which falls as the purchase and
	// the yearly costs spread over more km, from then to now; and what it costs a month on average.
	// The table below is for screen readers.
	import { page } from '$app/state';
	import { LineChart } from 'layerchart';
	import type { CostPerKm } from '#lib/expense/car-costs.ts';
	import { perDistance } from '#lib/expense/driving.ts';
	import { shownAmount } from '#lib/shown-money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	type Props = { perKm: CostPerKm[]; monthly: number | null; currency: string };
	let { perKm, monthly, currency }: Props = $props();

	const units = $derived(page.data.units);
	const imperial = $derived(units === 'imperial');
	const money = (cents: number) => shownAmount(cents, currency);
	const perUnit = (point: CostPerKm) => perDistance(point.centsPerKm, units);
	const month = new Intl.DateTimeFormat(getLocale(), {
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});
	const label = (iso: string) => month.format(new Date(`${iso}-01T00:00:00Z`));

	const points = $derived(perKm.map((point) => ({ ...point, cost: perUnit(point) })));
</script>

<div
	class="mx-4 flex flex-col gap-4 rounded-2xl bg-surface p-4 dark:bg-surface-night"
	data-testid="car-costs"
>
	{#if points.length > 1}
		<div class="flex flex-col gap-2">
			<p class="flex items-baseline justify-between text-sm">
				<span class="text-muted"
					>{imperial ? m.car_cost_per_mile_over_time() : m.car_cost_per_km_over_time()}</span
				>
				<span class="font-semibold tabular-nums">{money(points.at(-1)!.cost)}</span>
			</p>
			<div class="h-28" aria-hidden="true">
				<LineChart
					data={points}
					x="month"
					y="cost"
					axis={false}
					grid={false}
					rule={false}
					tooltipContext={false}
					props={{ spline: { class: 'stroke-2 stroke-accent dark:stroke-accent-night' } }}
				/>
			</div>
			<p class="flex justify-between text-xs text-muted">
				<span>{label(points[0].month)} · {money(points[0].cost)}</span>
				<span>{label(points.at(-1)!.month)}</span>
			</p>
			<table class="sr-only">
				<caption
					>{imperial ? m.car_cost_per_mile_over_time() : m.car_cost_per_km_over_time()}</caption
				>
				<tbody>
					{#each points as point (point.month)}
						<tr><th scope="row">{label(point.month)}</th><td>{money(point.cost)}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
	{#if monthly !== null}
		<div class="flex flex-col gap-2 border-t border-current/10 pt-3 first:border-0 first:pt-0">
			<p class="flex items-baseline justify-between text-sm">
				<span class="text-muted">{m.car_monthly_cost()}</span>
				<span class="text-base font-semibold tabular-nums">{money(monthly)}</span>
			</p>
		</div>
	{/if}
</div>
