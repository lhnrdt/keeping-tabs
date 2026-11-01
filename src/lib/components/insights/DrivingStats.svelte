<script lang="ts">
	// A car group's driving as a dashboard: the latest reading on an odometer, the km driven, consumption on a dial, the
	// price per litre on a fuel pump's display and what a km costs.
	import { page } from '$app/state';
	import { formatDistance, perDistance, perFuel, type Driving } from '#lib/expense/driving.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import ConsumptionGauge from './ConsumptionGauge.svelte';
	import Odometer from './Odometer.svelte';

	let { driving, currency }: { driving: Driving; currency: string } = $props();

	const units = $derived(page.data.units);
	const imperial = $derived(units === 'imperial');
	const money = (cents: number) => formatAmount(cents, currency, getLocale());
</script>

<div
	class="mx-4 flex flex-col gap-4 rounded-2xl bg-surface p-4 dark:bg-surface-night"
	data-testid="driving"
>
	{#if driving.odometerM}
		<div class="flex flex-col gap-1.5">
			<Odometer metres={driving.odometerM} />
			<p class="text-center text-sm text-muted">{m.driving_odometer()}</p>
		</div>
	{/if}
	<div class="grid grid-cols-2 items-end gap-4">
		{#if driving.litresPer100Km !== null}
			<ConsumptionGauge litresPer100Km={driving.litresPer100Km} />
		{/if}
		{#if driving.centsPerLitre !== null}
			<div class="flex flex-col items-center">
				<p
					class="w-full rounded-lg bg-canvas-night px-2 py-3 text-center font-mono text-xl font-semibold text-accent-night tabular-nums"
				>
					{money(perFuel(driving.centsPerLitre, units))}
				</p>
				<p class="mt-1 text-sm text-muted">
					{imperial ? m.driving_price_per_gallon() : m.driving_price_per_litre()}
				</p>
			</div>
		{/if}
	</div>
	{#if driving.drivenM}
		<p class="flex items-baseline justify-between border-t border-current/10 pt-3 text-sm">
			<span class="text-muted">{imperial ? m.driving_miles() : m.driving_km()}</span>
			<span class="text-base font-semibold tabular-nums"
				>{formatDistance(driving.drivenM, getLocale(), units)}</span
			>
		</p>
	{/if}
	{#if driving.centsPerKm !== null}
		<p class="flex items-baseline justify-between border-t border-current/10 pt-3 text-sm">
			<span class="text-muted"
				>{imperial ? m.driving_cost_per_mile() : m.driving_cost_per_km()}</span
			>
			<span class="text-base font-semibold tabular-nums"
				>{money(perDistance(driving.centsPerKm, units))}</span
			>
		</p>
	{/if}
</div>
