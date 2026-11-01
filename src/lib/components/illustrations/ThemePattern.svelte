<!-- The nature theme's header scene (#60, #274): flat, in the header's own colors, behind the content -->
<script lang="ts">
	import { SCENES } from '#lib/themes/scenes.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';

	const theme = useTheme();
	const scene = $derived(SCENES[theme.id]);
</script>

<svg
	class="pointer-events-none absolute inset-0 h-full w-full"
	viewBox="0 0 400 200"
	preserveAspectRatio="xMaxYMax slice"
	aria-hidden="true"
	fill="none"
>
	{#each scene.shapes as shape, i (i)}
		<path
			d={shape.d}
			fill={shape.cut ? 'var(--tint-bg)' : 'var(--tint-line)'}
			fill-opacity={shape.strength}
		/>
	{/each}
	{#each scene.lines ?? [] as line, i (i)}
		<path
			d={line.d}
			stroke="var(--tint-line)"
			stroke-opacity={line.strength}
			stroke-width="1.5"
			stroke-linecap="round"
		/>
	{/each}
	{#each scene.dots ?? [] as [cx, cy, r, strength], i (i)}
		<circle {cx} {cy} {r} fill="var(--tint-line)" fill-opacity={strength} />
	{/each}
</svg>
