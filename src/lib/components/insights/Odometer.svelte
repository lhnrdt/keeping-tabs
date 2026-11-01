<script lang="ts">
	// Km driven as a car's odometer: digits on dark rollers that turn into place, the tenth
	// set apart. The rollers are decoration; the number itself is there for screen readers.
	import { formatKm, odometerDigits } from '#lib/expense/driving.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';

	let { metres }: { metres: number } = $props();

	const digits = $derived(odometerDigits(metres));
</script>

<span class="sr-only">{formatKm(metres, getLocale())}</span>
<div class="flex items-center justify-center gap-[3px]" aria-hidden="true" data-testid="odometer">
	{#each digits.whole as digit, i (i)}
		<span class="odometer-digit bg-canvas-night text-ink-night">
			<span style={`animation-delay: ${i * 60}ms`}>{digit}</span>
		</span>
	{/each}
	<span class="odometer-digit bg-ink-night text-canvas-night">
		<span style={`animation-delay: ${digits.whole.length * 60}ms`}>{digits.tenth}</span>
	</span>
	<span class="ms-1.5 self-end text-sm font-medium text-muted">km</span>
</div>

<style>
	.odometer-digit {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 2.5rem;
		overflow: hidden;
		border-radius: 0.25rem;
		font-size: 1.375rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	@media (prefers-reduced-motion: no-preference) {
		.odometer-digit > span {
			animation: roll 500ms var(--ease-calm) both;
		}
	}
	@keyframes roll {
		from {
			transform: translateY(110%);
		}
	}
</style>
