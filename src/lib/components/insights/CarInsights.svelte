<script lang="ts">
	// A car group's driving and what the car costs (#366), with or without its purchase: one
	// switch for all of the numbers, there only when a purchase is noted.
	import { Toggle } from 'konsta/svelte';
	import type { CarViews } from '#lib/expense/car-costs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import CarCosts from './CarCosts.svelte';
	import DrivingStats from './DrivingStats.svelte';

	let { car, currency }: { car: CarViews; currency: string } = $props();

	let withPurchase = $state(true);
	const view = $derived(
		withPurchase || !car.withoutPurchase ? car.withPurchase : car.withoutPurchase
	);
</script>

{#if car.withoutPurchase}
	<div class="mx-4 mb-3 flex items-center justify-between gap-3 text-sm">
		<span class="text-muted">{m.car_with_purchase()}</span>
		<Toggle
			checked={withPurchase}
			onChange={() => (withPurchase = !withPurchase)}
			aria-label={m.car_with_purchase()}
		/>
	</div>
{/if}
{#if view.driving}
	<DrivingStats driving={view.driving} {currency} />
{/if}
{#if view.perKm.length > 1 || view.monthly !== null}
	<div class="mt-3">
		<CarCosts perKm={view.perKm} monthly={view.monthly} {currency} />
	</div>
{/if}
