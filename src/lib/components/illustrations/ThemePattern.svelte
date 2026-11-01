<!-- The nature theme's header scene (#60, #274), with the group's type in front if there is one: flat, in the header's own colors, behind the content -->
<script lang="ts">
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { GROUP_SUBJECTS, LANDSCAPE_STRENGTH } from '#lib/themes/group-subjects.ts';
	import { SCENES, type Scene } from '#lib/themes/scenes.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';

	let { kind }: { kind?: GroupKind } = $props();

	const theme = useTheme();
	/** Back to front, each at its strength */
	const layers: { scene: Scene; strength: number }[] = $derived(
		kind
			? [
					{ scene: SCENES[theme.id], strength: LANDSCAPE_STRENGTH },
					{ scene: GROUP_SUBJECTS[kind], strength: 1 }
				]
			: [{ scene: SCENES[theme.id], strength: 1 }]
	);
</script>

<svg
	class="pointer-events-none absolute inset-0 h-full w-full"
	viewBox="0 0 400 200"
	preserveAspectRatio="xMaxYMax slice"
	aria-hidden="true"
	fill="none"
>
	{#each layers as { scene, strength }, l (l)}
		{#each scene.shapes as shape, i (i)}
			<path
				d={shape.d}
				fill={shape.cut ? 'var(--tint-bg)' : 'var(--tint-line)'}
				fill-opacity={shape.cut ? 1 : shape.strength * strength}
			/>
		{/each}
		{#each scene.lines ?? [] as line, i (i)}
			<path
				d={line.d}
				stroke="var(--tint-line)"
				stroke-opacity={line.strength * strength}
				stroke-width="1.5"
				stroke-linecap="round"
			/>
		{/each}
		{#each scene.dots ?? [] as [cx, cy, r, dot], i (i)}
			<circle {cx} {cy} {r} fill="var(--tint-line)" fill-opacity={dot * strength} />
		{/each}
	{/each}
</svg>
