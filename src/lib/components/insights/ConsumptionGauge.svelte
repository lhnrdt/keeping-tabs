<script lang="ts">
	// Consumption as a dashboard dial: a needle sweeping over 0 to 15 l per 100 km, or 0 to 60
	// miles per gallon. The number stays below it, so nothing depends on reading the needle.
	import { page } from '$app/state';
	import { consumptionIn, consumptionScale, fuelUnit, needleAngle } from '#lib/expense/driving.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	let { litresPer100Km }: { litresPer100Km: number } = $props();

	const units = $derived(page.data.units);
	const reading = $derived(consumptionIn(litresPer100Km, units));
	const end = $derived(consumptionScale(units));
	const value = $derived(
		new Intl.NumberFormat(getLocale(), { maximumFractionDigits: 1 }).format(reading)
	);
	const scale = [0, 1 / 3, 2 / 3, 1];
	const tick = (mark: number) => mark * 180 - 90;
</script>

<div class="flex flex-col items-center">
	<svg viewBox="0 0 120 68" class="w-full max-w-36" aria-hidden="true">
		<path
			d="M 12 60 A 48 48 0 0 1 108 60"
			fill="none"
			stroke="currentColor"
			stroke-opacity="0.15"
			stroke-width="6"
			stroke-linecap="round"
		/>
		{#each scale as mark (mark)}
			<line
				x1="60"
				y1="19"
				x2="60"
				y2="25"
				stroke="currentColor"
				stroke-opacity="0.55"
				stroke-width="1.5"
				transform={`rotate(${tick(mark)} 60 60)`}
			/>
		{/each}
		<g class="needle" style={`--angle: ${needleAngle(reading, end)}deg`}>
			<line
				x1="60"
				y1="60"
				x2="60"
				y2="22"
				class="stroke-accent dark:stroke-accent-night"
				stroke-width="2.5"
				stroke-linecap="round"
			/>
		</g>
		<circle cx="60" cy="60" r="4.5" class="fill-accent dark:fill-accent-night" />
	</svg>
	<p class="mt-1 text-xl font-semibold">
		{units === 'imperial' ? `${value} mpg` : `${value} ${fuelUnit(units)}`}
	</p>
	<p class="text-sm text-muted">
		{units === 'imperial' ? m.driving_mpg() : m.driving_consumption()}
	</p>
</div>

<style>
	.needle {
		transform-origin: 60px 60px;
		transform: rotate(var(--angle));
	}
	@media (prefers-reduced-motion: no-preference) {
		.needle {
			animation: sweep 800ms var(--ease-calm) both;
		}
	}
	@keyframes sweep {
		from {
			transform: rotate(-90deg);
		}
	}
</style>
