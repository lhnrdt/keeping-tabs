<script lang="ts">
	// A car group's driving in numbers: km, what a km costs, consumption and the price of fuel.
	import { formatKm, type Driving } from '#lib/expense/driving.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	let { driving, currency }: { driving: Driving; currency: string } = $props();

	const money = (cents: number) => formatAmount(cents, currency, getLocale());
	const consumption = new Intl.NumberFormat(getLocale(), { maximumFractionDigits: 1 });
	const tiles = $derived(
		[
			driving.metres
				? { label: m.driving_km(), value: formatKm(driving.metres, getLocale()) }
				: null,
			driving.centsPerKm === null
				? null
				: { label: m.driving_cost_per_km(), value: money(driving.centsPerKm) },
			driving.litresPer100Km === null
				? null
				: {
						label: m.driving_consumption(),
						value: `${consumption.format(driving.litresPer100Km)} l`
					},
			driving.centsPerLitre === null
				? null
				: { label: m.driving_price_per_litre(), value: money(driving.centsPerLitre) }
		].filter((tile) => tile !== null)
	);
</script>

<dl class="mx-4 grid grid-cols-2 gap-3" data-testid="driving">
	{#each tiles as tile (tile.label)}
		<div class="rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
			<dt class="text-sm text-muted">{tile.label}</dt>
			<dd class="mt-1 text-xl font-semibold">{tile.value}</dd>
		</div>
	{/each}
</dl>
