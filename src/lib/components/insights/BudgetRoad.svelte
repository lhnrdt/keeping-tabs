<script lang="ts">
	// The budget as a road (#168): the car has come as far as the money has gone, and the flag is
	// where it runs out. For the eye: the numbers are right next to it.
	import { onMount } from 'svelte';
	import { subjectOf } from '#lib/themes/group-subjects.ts';

	let { spent, budget }: { spent: number; budget: number } = $props();

	// The car's own 400×200 canvas, without the ground it stands on
	// The everyday car, as in the forest theme
	const car = subjectOf('car', 'forest').shapes.slice(1);
	const over = $derived(spent > budget);
	const WIDTH = 320;
	const FLAG_AT = WIDTH - 22;
	const position = $derived(Math.min(spent / Math.max(budget, 1), 1) * (FLAG_AT - 32));

	// From the start of the road, on its way there
	let arrived = $state(false);
	onMount(() => {
		arrived = true;
	});
</script>

<svg
	viewBox="0 0 {WIDTH} 44"
	class="mb-2 w-full {over ? 'tone-negative' : 'text-accent dark:text-accent-night'}"
	aria-hidden="true"
	data-testid="budget-road"
	fill="currentColor"
>
	<path d="M0 38H{WIDTH}" stroke="currentColor" stroke-opacity="0.25" stroke-width="4" />
	<path
		d="M0 38H{WIDTH}"
		stroke="var(--color-canvas)"
		stroke-width="1"
		stroke-dasharray="8 8"
		class="dark:[stroke:var(--color-canvas-night)]"
	/>
	<path d="M{FLAG_AT} 36V12" stroke="currentColor" stroke-width="2" />
	<path d="M{FLAG_AT + 1} 12l13 5-13 5Z" />
	<g class="budget-car" style:transform="translateX({arrived ? position : 0}px)">
		<g transform="translate(-58 -13) scale(0.26)" class="scene-idle">
			{#each car as shape, i (i)}
				<path
					d={shape.d}
					fill={shape.cut ? 'var(--color-surface)' : 'currentColor'}
					class={shape.cut ? 'dark:[fill:var(--color-surface-night)]' : ''}
				/>
			{/each}
		</g>
	</g>
</svg>

<style>
	.budget-car {
		transition: transform 1200ms var(--ease-calm);
	}
	@media (prefers-reduced-motion: reduce) {
		.budget-car {
			transition: none;
		}
	}
</style>
