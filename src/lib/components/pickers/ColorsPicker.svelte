<script lang="ts">
	// Choose the app's colours (#60, #332): the scenery's own, or another theme's. Each a round
	// swatch in those colours (the header, a card, the accent), light or dark like the app.
	import { m } from '#lib/paraglide/messages.js';
	import { COLORS, LIKE_SCENERY, type Colors } from '#lib/settings.ts';
	import type { ThemeId } from '#lib/themes/palettes.ts';
	import { themeLabels } from './theme-labels';

	type Props = {
		value: Colors;
		/** The scenery shown today, whose colours "like the scenery" are */
		scenery: ThemeId;
	};
	let { value, scenery }: Props = $props();
</script>

<fieldset class="px-4">
	<legend class="sr-only">{m.settings_colors()}</legend>
	<div class="grid grid-cols-5 gap-x-1 gap-y-3">
		{#each COLORS as colors (colors)}
			<label
				class="flex cursor-pointer flex-col items-center gap-1.5"
				data-accent={colors === LIKE_SCENERY ? scenery : colors}
			>
				<input
					class="peer sr-only"
					type="radio"
					name="colors"
					value={colors}
					checked={colors === value}
				/>
				<span
					class="swatch grid size-16 place-items-center rounded-full ring-(--accent) ring-offset-2 ring-offset-canvas peer-checked:ring-2 peer-focus-visible:ring-2 dark:ring-(--accent-night) dark:ring-offset-canvas-night"
				>
					<span class="size-4 rounded-full bg-(--accent) dark:bg-(--accent-night)"></span>
				</span>
				<span class="text-center text-xs leading-tight text-ink dark:text-ink-night">
					{colors === LIKE_SCENERY ? m.colors_like_scenery() : themeLabels[colors]()}
				</span>
			</label>
		{/each}
	</div>
</fieldset>

<style>
	/* The header's colour above, a card's below */
	.swatch {
		background: linear-gradient(var(--hero-bg) 50%, var(--surface) 50%);
	}
	@media (prefers-color-scheme: dark) {
		.swatch {
			background: linear-gradient(var(--hero-bg-night) 50%, var(--surface-night) 50%);
		}
	}
</style>
