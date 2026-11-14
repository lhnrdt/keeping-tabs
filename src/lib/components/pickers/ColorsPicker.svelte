<script lang="ts">
	// Choose the app's colours (#60, #332): the scenery's own, or another theme's. Each swatch is a
	// small preview in those colours (background, a card, the accent), light or dark like the app.
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
	<div class="grid grid-cols-3 gap-3">
		{#each COLORS as colors (colors)}
			<label class="cursor-pointer" data-accent={colors === LIKE_SCENERY ? scenery : colors}>
				<input
					class="peer sr-only"
					type="radio"
					name="colors"
					value={colors}
					checked={colors === value}
				/>
				<span
					class="flex h-full flex-col gap-1.5 rounded-2xl border-2 border-transparent bg-(--canvas) p-2 peer-checked:border-(--accent) peer-focus-visible:ring-2 dark:bg-(--canvas-night) dark:peer-checked:border-(--accent-night)"
				>
					<span class="h-6 rounded-lg bg-(--hero-bg) dark:bg-(--hero-bg-night)"></span>
					<span class="flex items-center gap-1.5">
						<span class="h-4 flex-1 rounded-md bg-(--surface) dark:bg-(--surface-night)"></span>
						<span class="h-4 w-4 rounded-full bg-(--accent) dark:bg-(--accent-night)"></span>
					</span>
					<span class="text-center text-xs text-(--ink) dark:text-(--ink-night)">
						{colors === LIKE_SCENERY ? m.colors_like_scenery() : themeLabels[colors]()}
					</span>
				</span>
			</label>
		{/each}
	</div>
</fieldset>
