<!-- The nature theme's header scene (#60, #274), with the group's type in front if there is one: flat, in the header's own colors, behind the content -->
<script lang="ts">
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { GROUP_SETTLED, GROUP_SUBJECTS, LANDSCAPE_STRENGTH } from '#lib/themes/group-subjects.ts';
	import { SCENES, type Scene } from '#lib/themes/scenes.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';
	import { onMount } from 'svelte';

	type Props = {
		kind?: GroupKind;
		/** You're settled up here: the scene shows it */
		settled?: boolean;
		/** ...and that's new: it comes in with a little bounce */
		celebrate?: boolean;
	};

	let { kind, settled = false, celebrate = false }: Props = $props();

	/** Snow is bright, but the header's text comes first */
	const SNOW_STRENGTH = 0.6;

	const theme = useTheme();

	// Tapping the header, anywhere but on what's in it, makes the scene hop (#291)
	let svg: SVGSVGElement;
	let poked = $state(false);
	const INTERACTIVE = 'a, button, input, select, textarea, label, summary';
	onMount(() => {
		const header = svg.parentElement;
		const poke = (event: MouseEvent) => {
			if ((event.target as Element).closest(INTERACTIVE)) return;
			poked = false;
			requestAnimationFrame(() => (poked = true));
		};
		header?.addEventListener('click', poke);
		return () => header?.removeEventListener('click', poke);
	});
	/** Back to front, each at its strength */
	const layers: { scene: Scene; strength: number; moment?: boolean }[] = $derived(
		kind
			? [
					{ scene: SCENES[theme.id], strength: LANDSCAPE_STRENGTH },
					{ scene: GROUP_SUBJECTS[kind], strength: 1 },
					...(settled ? [{ scene: GROUP_SETTLED[kind], strength: 1, moment: true }] : [])
				]
			: [{ scene: SCENES[theme.id], strength: 1 }]
	);
</script>

<svg
	bind:this={svg}
	onanimationend={(event) => {
		if (event.animationName === 'scene-poke') poked = false;
	}}
	class="pointer-events-none absolute inset-0 h-full w-full {poked ? 'scene-poke' : ''}"
	viewBox="0 0 400 200"
	preserveAspectRatio="xMaxYMax slice"
	aria-hidden="true"
	fill="none"
	data-testid={kind ? 'group-scene' : undefined}
	data-settled={kind ? settled : undefined}
>
	{#each layers as { scene, strength, moment }, l (l)}
		<g class={moment && celebrate ? 'scene-celebrate' : undefined}>
			{#each scene.shapes as shape, i (i)}
				<!-- Solid: the line color is see-through, so whatever's behind a shape would show -->
				{#if !shape.cut}
					<path
						d={shape.d}
						fill="var(--tint-bg)"
						class={shape.motion ? `scene-${shape.motion}` : undefined}
					/>
				{/if}
				<path
					d={shape.d}
					fill={shape.snow ? '#fff' : shape.cut ? 'var(--tint-bg)' : 'var(--tint-line)'}
					fill-opacity={shape.snow ? SNOW_STRENGTH : shape.cut ? 1 : shape.strength * strength}
					class={shape.motion ? `scene-${shape.motion}` : undefined}
				/>
			{/each}
			{#each scene.lines ?? [] as line, i (i)}
				<path
					d={line.d}
					stroke="var(--tint-line)"
					stroke-opacity={line.strength * strength}
					stroke-width="1.5"
					stroke-linecap="round"
					class={line.motion ? `scene-${line.motion}` : undefined}
				/>
			{/each}
			{#each scene.dots ?? [] as [cx, cy, r, dot], i (i)}
				<circle {cx} {cy} {r} fill="var(--tint-line)" fill-opacity={dot * strength} />
			{/each}
		</g>
	{/each}
</svg>
