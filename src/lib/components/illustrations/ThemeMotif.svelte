<!-- The nature theme's motif (#60, #274) for empty states, errors and the welcome page -->
<script lang="ts">
	import { page } from '$app/state';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { MOTIFS } from '#lib/themes/art.ts';
	import { mirrorOf } from '#lib/themes/scenes.ts';
	import { MOMENTS, type Moment } from '#lib/themes/moments.ts';
	import { subjectOf } from '#lib/themes/group-subjects.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';

	/** Something's off (#291): its own scene instead of the theme's or the group's */
	let { moment }: { moment?: Moment } = $props();

	const theme = useTheme();
	// In a group: what it's about, in the same round window
	const kind: GroupKind | undefined = $derived(moment ? undefined : page.data.group?.kind);
	const art = $derived(
		moment ? MOMENTS[moment] : kind ? subjectOf(kind, theme.id) : MOTIFS[theme.id]
	);
	const cx = $derived(kind ? 310 : 60);
	const cy = $derived(kind ? 136 : 60);
	const radius = $derived(kind ? 77 : 58);
	const clip = $props.id();
</script>

<svg
	viewBox={kind ? '230 56 160 160' : '0 0 120 120'}
	data-testid={kind ? 'empty-scene' : undefined}
	data-kind={kind}
	data-moment={moment}
	class="h-28 w-28 text-accent dark:text-accent-night"
	aria-hidden="true"
>
	<clipPath id={clip}><circle {cx} {cy} r={radius} /></clipPath>
	<g clip-path={`url(#${clip})`} fill="currentColor">
		<circle {cx} {cy} r={radius} opacity="0.12" />
		{#each art.shapes as shape, i (i)}
			<g transform={mirrorOf(shape)}>
				{#if shape.snow}
					<path d={shape.d} fill="#fff" />
				{:else if shape.cut}
					<path d={shape.d} class="text-canvas dark:text-canvas-night" />
				{:else}
					<!-- Solid: whatever's behind a shape shouldn't show through it -->
					<path
						d={shape.d}
						class="text-canvas dark:text-canvas-night {shape.motion ? `scene-${shape.motion}` : ''}"
					/>
					<path
						d={shape.d}
						opacity={shape.strength}
						class={shape.motion ? `scene-${shape.motion}` : undefined}
					/>
				{/if}
			</g>
		{/each}
		{#each art.lines ?? [] as line, i (i)}
			<path
				d={line.d}
				fill="none"
				stroke="currentColor"
				stroke-width="2.2"
				stroke-linecap="round"
				opacity={line.strength}
				class={line.motion ? `scene-${line.motion}` : undefined}
			/>
		{/each}
		{#each art.dots ?? [] as [cx, cy, r, strength], i (i)}
			<circle {cx} {cy} {r} opacity={strength} />
		{/each}
	</g>
</svg>
