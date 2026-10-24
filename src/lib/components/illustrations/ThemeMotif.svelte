<!-- The nature theme's motif (#60) for empty states, errors and the welcome page -->
<script lang="ts">
	import { MOTIFS } from '#lib/themes/art.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';

	const theme = useTheme();
	const art = $derived(MOTIFS[theme.id]);
</script>

<svg
	viewBox="0 0 120 120"
	class="h-24 w-24 text-accent-soft dark:text-accent-night"
	aria-hidden="true"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	{#each art.paths as d, i (i)}<path {d} />{/each}
	{#each art.faint ?? [] as d, i (i)}<path {d} opacity="0.6" />{/each}
	{#each art.dots ?? [] as [cx, cy, r], i (i)}<circle {cx} {cy} {r} fill="currentColor" />{/each}
</svg>
