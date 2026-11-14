<script lang="ts">
	// Your own colour (#330), picked in the app's own look instead of the browser's: its hue on a
	// rainbow, how colourful and how bright it is. The whole app takes the theme it makes as you
	// go, and a preview shows it light and dark; cancelling puts back what was there.
	import { Sheet } from 'konsta/svelte';
	import { clampChroma, converter, formatHex } from 'culori';
	import { m } from '#lib/paraglide/messages.js';
	import { applyLook } from '#lib/themes/apply-look.ts';
	import { ownThemeProperties, styleOf } from '#lib/themes/own-theme.ts';
	import type { ThemeId } from '#lib/themes/palettes.ts';

	type Props = {
		opened: boolean;
		/** What to start from */
		color: string;
		/** The scenery the theme goes with, as the page's colours underneath */
		scenery: ThemeId;
		onPick: (color: string) => void;
		onClose: () => void;
	};
	let { opened, color, scenery, onPick, onClose }: Props = $props();

	/** As colourful as it gets without the hue drifting */
	const MAX_CHROMA = 0.2;
	/** From deep to bright: past these it's black or white, whatever the hue */
	const DARKEST = 0.35;
	const BRIGHTEST = 0.92;

	const start = () => converter('oklch')(color) ?? { mode: 'oklch' as const, l: 0.6, c: 0.1 };
	let hue = $state(0);
	let chroma = $state(0.1);
	let light = $state(0.6);
	$effect(() => {
		if (!opened) return;
		const { h = 0, c, l } = start();
		hue = Math.round(h);
		chroma = Math.min(c, MAX_CHROMA);
		light = Math.min(Math.max(l, DARKEST), BRIGHTEST);
	});

	const at = (h: number, c: number, l = light) =>
		formatHex(clampChroma({ mode: 'oklch', l, c, h }, 'oklch'));
	const picked = $derived(at(hue, chroma));
	const brightness = $derived(
		`linear-gradient(to right, ${at(hue, chroma, DARKEST)}, ${at(hue, chroma, (DARKEST + BRIGHTEST) / 2)}, ${at(hue, chroma, BRIGHTEST)})`
	);
	// The whole app in it while picking, a frame at a time however fast the slider goes
	let frame = 0;
	$effect(() => {
		if (!opened) return;
		const look = { colors: scenery, own: picked as `#${string}` };
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => applyLook(look));
	});

	/** Its own changes, not the settings form's: only "Use this colour" saves */
	const own = (event: Event) => event.stopPropagation();
	const theme = $derived(styleOf(ownThemeProperties(picked)));
	const rainbow = `linear-gradient(to right, ${Array.from({ length: 13 }, (_, i) => at(i * 30, 0.15, 0.65)).join(', ')})`;
	const fullness = $derived(`linear-gradient(to right, ${at(hue, 0)}, ${at(hue, MAX_CHROMA)})`);
</script>

{#snippet preview(mode: string, label: string)}
	{@const v = (name: string) => `var(--${name}${mode})`}
	<figure class="pointer-events-none flex flex-col items-center gap-1.5">
		<div
			class="flex w-full flex-col gap-1.5 rounded-2xl p-2 ring-1 ring-current/15"
			style="background: {v('canvas')}"
		>
			<div
				class="flex h-10 items-end rounded-lg px-2 pb-1 font-display text-sm font-semibold"
				style="background: {v('hero-bg')}; color: {v('hero-fg')}"
			>
				Keeping Tabs
			</div>
			<div
				class="flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-xs"
				style="background: {v('surface')}; color: {v('ink')}"
			>
				<span class="truncate">{m.colors_own_preview()}</span>
				<span class="font-medium" style="color: {v('accent')}">12 €</span>
			</div>
			<span
				class="self-end rounded-full px-3 py-1 text-xs font-semibold"
				style="background: {v('accent')}; color: {v(mode ? 'canvas' : 'surface')}"
				>{m.add_expense()}</span
			>
		</div>
		<figcaption class="text-xs text-muted">{label}</figcaption>
	</figure>
{/snippet}

<!-- No dimming: the app behind shows the colour. A tap there still closes, like a backdrop's -->
{#if opened}
	<button
		type="button"
		class="fixed inset-0 z-40 cursor-default"
		aria-label={m.cancel()}
		tabindex="-1"
		onclick={onClose}
	></button>
{/if}
<Sheet
	class="rounded-t-3xl shadow-[0_-8px_32px_rgb(0_0_0/0.18)]"
	{opened}
	backdrop={false}
	role="dialog"
	aria-modal="true"
	aria-labelledby="own-color-title"
>
	<div
		class="mx-auto flex max-w-app flex-col gap-5 px-6 pt-6 pb-[calc(var(--k-safe-area-bottom,0px)+1.5rem)]"
	>
		<h2 id="own-color-title" class="font-display text-2xl font-semibold">{m.colors_own()}</h2>
		<!-- The theme it makes, light and dark: a little screen of each, with a header, a card and a
		     button, labelled as previews so nobody taps them -->
		<div class="flex flex-col gap-2">
			<span class="field-label">{m.colors_own_preview_label()}</span>
			<div class="grid grid-cols-2 gap-3" style={theme} aria-hidden="true">
				{@render preview('', m.theme_light())}
				{@render preview('-night', m.theme_dark())}
			</div>
		</div>
		<label class="flex flex-col gap-2">
			<span class="field-label">{m.colors_own_hue()}</span>
			<input
				class="color-track"
				type="range"
				min="0"
				max="359"
				bind:value={hue}
				style="background: {rainbow}"
				onchange={own}
			/>
		</label>
		<label class="flex flex-col gap-2">
			<span class="field-label">{m.colors_own_chroma()}</span>
			<input
				class="color-track"
				type="range"
				min="0"
				max={MAX_CHROMA}
				step="0.005"
				bind:value={chroma}
				style="background: {fullness}"
				onchange={own}
			/>
		</label>
		<label class="flex flex-col gap-2">
			<span class="field-label">{m.colors_own_lightness()}</span>
			<input
				class="color-track"
				type="range"
				min={DARKEST}
				max={BRIGHTEST}
				step="0.01"
				bind:value={light}
				style="background: {brightness}"
				onchange={own}
			/>
		</label>
		<div class="flex gap-3">
			<button
				type="button"
				class="h-12 flex-1 rounded-full font-semibold text-accent dark:text-accent-night"
				onclick={onClose}>{m.cancel()}</button
			>
			<button
				type="button"
				class="h-12 flex-[2] rounded-full bg-accent font-semibold text-white dark:bg-accent-night dark:text-canvas-night"
				onclick={() => onPick(picked)}>{m.colors_own_use()}</button
			>
		</div>
	</div>
</Sheet>

<style>
	/* A thick rounded track in the colours it picks from, and a plain white handle on it */
	.color-track {
		appearance: none;
		height: 2rem;
		border-radius: 999px;
		cursor: pointer;
	}
	.color-track::-webkit-slider-thumb {
		appearance: none;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		background: #fff;
		border: 2px solid rgb(0 0 0 / 0.15);
		box-shadow: 0 2px 6px rgb(0 0 0 / 0.25);
	}
	.color-track::-moz-range-thumb {
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		background: #fff;
		border: 2px solid rgb(0 0 0 / 0.15);
		box-shadow: 0 2px 6px rgb(0 0 0 / 0.25);
	}
	.color-track:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 3px;
	}
</style>
