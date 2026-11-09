<!-- The nature theme's header scene (#60, #274), with the group's type in front if there is one: flat, in the header's own colors, behind the content -->
<script lang="ts">
	import SceneEffect from './SceneEffect.svelte';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import {
		GROUP_SETTLED,
		LANDSCAPE_STRENGTH,
		SUBJECT_INK,
		subjectOf
	} from '#lib/themes/group-subjects.ts';
	import { mirrorOf, SCENES, type Scene } from '#lib/themes/scenes.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';
	import type { ThemeId } from '#lib/themes/palettes.ts';
	import { atNight, hasSun, isNight, moonForSun } from '#lib/themes/time-of-day.ts';
	import { onMount } from 'svelte';

	type Props = {
		kind?: GroupKind;
		/** You're settled up here: the scene shows it */
		settled?: boolean;
		/** ...and that's new: it comes in with a little bounce */
		celebrate?: boolean;
		/** Another theme's scene than the one in use, e.g. to show what a theme looks like */
		themeId?: ThemeId;
	};

	let { kind, settled = false, celebrate = false, themeId }: Props = $props();

	/** Snow is bright, but the header's text comes first */
	const SNOW_STRENGTH = 0.6;

	const theme = useTheme();
	const shownTheme = $derived(themeId ?? theme.id);
	// The visitor's own time of day, so only once in the browser
	let night = $state(false);
	onMount(() => (night = isNight(new Date().getHours())));
	const moment = $derived(kind && settled ? GROUP_SETTLED[kind] : undefined);
	// A group's scene may bring its own background; otherwise the theme's landscape
	const backdrop = $derived((kind && subjectOf(kind, shownTheme).backdrop) || SCENES[shownTheme]);
	const landscape = $derived(
		night ? atNight(backdrop, { ownMoon: !(moment && hasSun(moment)) }) : backdrop
	);

	// Tapping the header, anywhere but on what's in it, plays the scene's action once (#327)
	let svg: SVGSVGElement;
	let acting = $state(false);
	const INTERACTIVE = 'a, button, input, select, textarea, label, summary';
	/** Long enough for the longest move */
	const ACTION_MS = 2600;
	/** Where each move happens, to draw its swoosh lines and particles round it */
	type Effect = { move: string; x: number; y: number; w: number; h: number };
	let effects: Effect[] = $state([]);
	const measure = () => {
		const boxes = new Map<string, DOMRect>();
		for (const el of svg.querySelectorAll<SVGGraphicsElement>('[class^="tap-"]')) {
			const move = el.getAttribute('class')!.slice(4);
			const box = el.getBBox();
			const seen = boxes.get(move);
			if (!seen) boxes.set(move, box);
			else {
				const x = Math.min(seen.x, box.x);
				const y = Math.min(seen.y, box.y);
				const right = Math.max(seen.x + seen.width, box.x + box.width);
				const bottom = Math.max(seen.y + seen.height, box.y + box.height);
				boxes.set(move, new DOMRect(x, y, right - x, bottom - y));
			}
		}
		return [...boxes].map(([move, b]) => ({ move, x: b.x, y: b.y, w: b.width, h: b.height }));
	};
	onMount(() => {
		const header = svg.parentElement;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const act = (event: MouseEvent) => {
			if ((event.target as Element).closest(INTERACTIVE)) return;
			acting = false;
			effects = [];
			clearTimeout(timer);
			requestAnimationFrame(() => {
				effects = measure();
				acting = true;
				timer = setTimeout(() => {
					acting = false;
					effects = [];
				}, ACTION_MS);
			});
		};
		header?.addEventListener('click', act);
		return () => {
			clearTimeout(timer);
			header?.removeEventListener('click', act);
		};
	});
	/** Back to front, each at its strength */
	type Layer = { scene: Scene; strength: number; moment?: boolean; subject?: boolean };
	const layers: Layer[] = $derived(
		kind
			? [
					{ scene: landscape, strength: LANDSCAPE_STRENGTH },
					{ scene: subjectOf(kind, shownTheme), strength: 1, subject: true },
					...(moment
						? [
								{
									scene: night ? moonForSun(moment) : moment,
									strength: 1,
									moment: true,
									subject: true
								}
							]
						: [])
				]
			: [{ scene: landscape, strength: 1 }]
	);

	/** A shared turning point, so the parts of one thing move together */
	const pivot = (origin?: [number, number]) =>
		origin ? `transform-box: view-box; transform-origin: ${origin[0]}px ${origin[1]}px` : undefined;
	const inkOf = (layer: Layer) => (layer.subject ? 'var(--tint-fg)' : 'var(--tint-line)');
	const opacityOf = (layer: Layer, strength: number) =>
		strength * layer.strength * (layer.subject ? SUBJECT_INK : 1);
</script>

<svg
	bind:this={svg}
	class="pointer-events-none absolute inset-0 h-full w-full overflow-visible {acting
		? 'scene-acting'
		: ''}"
	viewBox="0 0 400 200"
	preserveAspectRatio="xMaxYMax meet"
	aria-hidden="true"
	fill="none"
	data-testid={kind ? 'group-scene' : undefined}
	data-settled={kind ? settled : undefined}
>
	{#each layers as layer, l (l)}
		{@const { scene, moment } = layer}
		<g class={moment && celebrate ? 'scene-celebrate' : undefined}>
			{#each scene.shapes as shape, i (i)}
				<g class={shape.tap ? `tap-${shape.tap}` : undefined} style={pivot(shape.origin)}>
					<g transform={mirrorOf(shape)}>
						<!-- Solid: the line color is see-through, so whatever's behind a shape would show -->
						{#if !shape.cut}
							<path
								d={shape.d}
								fill="var(--tint-bg)"
								class={shape.motion ? `scene-${shape.motion}` : undefined}
								style={pivot(shape.origin)}
							/>
						{/if}
						<path
							d={shape.d}
							fill={shape.snow ? '#fff' : shape.cut ? 'var(--tint-bg)' : inkOf(layer)}
							fill-opacity={shape.snow
								? SNOW_STRENGTH
								: shape.cut
									? 1
									: opacityOf(layer, shape.strength)}
							class={shape.motion ? `scene-${shape.motion}` : undefined}
							style={pivot(shape.origin)}
						/>
					</g>
				</g>
			{/each}
			{#each scene.lines ?? [] as line, i (i)}
				<g class={line.tap ? `tap-${line.tap}` : undefined} style={pivot(line.origin)}>
					<path
						d={line.d}
						stroke={inkOf(layer)}
						stroke-opacity={opacityOf(layer, line.strength)}
						stroke-width={layer.subject ? 2.2 : 1.5}
						stroke-linecap="round"
						class={line.motion ? `scene-${line.motion}` : undefined}
						style={pivot(line.origin)}
					/>
				</g>
			{/each}
			{#each scene.dots ?? [] as [cx, cy, r, dot], i (i)}
				<circle {cx} {cy} {r} fill={inkOf(layer)} fill-opacity={opacityOf(layer, dot)} />
			{/each}
		</g>
	{/each}
	{#each effects as effect (effect.move)}
		<SceneEffect {...effect} />
	{/each}
</svg>
