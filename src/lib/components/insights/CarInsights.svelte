<script lang="ts">
	// A car group's driving and what the car costs (#366), with or without its purchase: one
	// switch for all of the numbers, there only when a purchase is noted, and remembered.
	import { Toggle } from 'konsta/svelte';
	import type { CarViews } from '#lib/expense/car-costs.ts';
	import { onMount } from 'svelte';
	import { rememberWithPurchase, withPurchaseFor } from '#lib/insights/purchase-choice.ts';
	import { m } from '#lib/paraglide/messages.js';
	import CarCosts from './CarCosts.svelte';
	import DrivingStats from './DrivingStats.svelte';

	let { car, currency, groupId }: { car: CarViews; currency: string; groupId: string } = $props();

	let withPurchase = $state(true);
	onMount(() => (withPurchase = withPurchaseFor(groupId)));
	function toggle() {
		withPurchase = !withPurchase;
		rememberWithPurchase(groupId, withPurchase);
	}
	const view = $derived(
		withPurchase || !car.withoutPurchase ? car.withPurchase : car.withoutPurchase
	);
</script>

{#if car.withoutPurchase}
	<div class="mx-4 mb-3 flex items-center justify-between gap-3 text-sm">
		<span class="text-muted">{m.car_with_purchase()}</span>
		<Toggle checked={withPurchase} onChange={toggle} aria-label={m.car_with_purchase()} />
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
