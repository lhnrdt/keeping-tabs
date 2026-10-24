<!-- The nature theme's header pattern (#60), low contrast in --tint-line behind the content -->
<script lang="ts">
	import { PATTERNS } from '#lib/themes/art.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';

	const theme = useTheme();
	const art = $derived(PATTERNS[theme.id]);
</script>

<svg
	class="pointer-events-none absolute inset-0 h-full w-full"
	viewBox="0 0 400 200"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	fill="none"
	stroke="var(--tint-line)"
	stroke-width="1.5"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	{#each art.paths as d, i (i)}<path {d} />{/each}
	{#each art.faint ?? [] as d, i (i)}<path {d} opacity="0.6" />{/each}
	{#each art.dots ?? [] as [cx, cy, r], i (i)}<circle
			{cx}
			{cy}
			{r}
			fill="var(--tint-line)"
		/>{/each}
</svg>
