<script lang="ts">
	// Choose the app's nature theme (#60): each swatch is a small preview in the theme's own
	// colors (background, a card, the accent), light or dark like the app.
	import { m } from '#lib/paraglide/messages.js';
	import { ACCENTS, type Accent } from '#lib/settings.ts';

	let { value }: { value: Accent } = $props();

	const labels: Record<Accent, () => string> = {
		forest: m.theme_forest,
		fjord: m.theme_fjord,
		mountains: m.theme_mountains,
		heather: m.theme_heather,
		birch: m.theme_birch,
		meadow: m.theme_meadow,
		coast: m.theme_coast,
		aurora: m.theme_aurora,
		autumn: m.theme_autumn
	};
</script>

<fieldset class="px-4">
	<legend class="sr-only">{m.settings_accent()}</legend>
	<div class="grid grid-cols-3 gap-3">
		{#each ACCENTS as accent (accent)}
			<label class="cursor-pointer" data-accent={accent}>
				<input
					class="peer sr-only"
					type="radio"
					name="accent"
					value={accent}
					checked={accent === value}
				/>
				<span
					class="flex flex-col gap-1.5 rounded-2xl border-2 border-transparent bg-(--canvas) p-2 peer-checked:border-(--accent) peer-focus-visible:ring-2 dark:bg-(--canvas-night) dark:peer-checked:border-(--accent-night)"
				>
					<span class="h-6 rounded-lg bg-(--hero-bg) dark:bg-(--hero-bg-night)"></span>
					<span class="flex items-center gap-1.5">
						<span class="h-4 flex-1 rounded-md bg-(--surface) dark:bg-(--surface-night)"></span>
						<span class="h-4 w-4 rounded-full bg-(--accent) dark:bg-(--accent-night)"></span>
					</span>
					<span class="text-center text-xs text-(--ink) dark:text-(--ink-night)">
						{labels[accent]()}
					</span>
				</span>
			</label>
		{/each}
	</div>
</fieldset>
