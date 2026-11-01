<!-- The nature theme's motif (#60, #274) for empty states, errors and the welcome page -->
<script lang="ts">
	import { MOTIFS } from '#lib/themes/art.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';

	const theme = useTheme();
	const art = $derived(MOTIFS[theme.id]);
	const clip = $props.id();
</script>

<svg viewBox="0 0 120 120" class="h-28 w-28 text-accent dark:text-accent-night" aria-hidden="true">
	<clipPath id={clip}><circle cx="60" cy="60" r="58" /></clipPath>
	<g clip-path={`url(#${clip})`} fill="currentColor">
		<circle cx="60" cy="60" r="58" opacity="0.12" />
		{#each art.shapes as shape, i (i)}
			{#if shape.snow}
				<path d={shape.d} fill="#fff" />
			{:else if shape.cut}
				<path d={shape.d} class="text-canvas dark:text-canvas-night" />
			{:else}
				<path d={shape.d} opacity={shape.strength} />
			{/if}
		{/each}
		{#each art.lines ?? [] as line, i (i)}
			<path
				d={line.d}
				fill="none"
				stroke="currentColor"
				stroke-width="2.2"
				stroke-linecap="round"
				opacity={line.strength}
			/>
		{/each}
		{#each art.dots ?? [] as [cx, cy, r, strength], i (i)}
			<circle {cx} {cy} {r} opacity={strength} />
		{/each}
	</g>
</svg>
