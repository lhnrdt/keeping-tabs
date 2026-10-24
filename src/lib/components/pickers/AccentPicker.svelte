<script lang="ts">
	// Choose the app's color theme (#60): a swatch per theme, in that theme's own color.
	import { m } from '#lib/paraglide/messages.js';
	import { ACCENTS, type Accent } from '#lib/settings.ts';

	let { value }: { value: Accent } = $props();

	const labels: Record<Accent, () => string> = {
		forest: m.accent_forest,
		fjord: m.accent_fjord,
		heather: m.accent_heather,
		amber: m.accent_amber
	};
</script>

<fieldset class="px-4">
	<legend class="sr-only">{m.settings_accent()}</legend>
	<div class="flex flex-wrap gap-4">
		{#each ACCENTS as accent (accent)}
			<label class="flex cursor-pointer flex-col items-center gap-1 text-xs" data-accent={accent}>
				<input
					class="peer sr-only"
					type="radio"
					name="accent"
					value={accent}
					checked={accent === value}
				/>
				<!-- The theme's color, ringed in it when chosen -->
				<span
					class="h-10 w-10 rounded-full border-2 border-transparent bg-(--accent) ring-offset-2 ring-offset-canvas peer-checked:ring-2 peer-checked:ring-(--accent) peer-focus-visible:outline-2 dark:bg-(--accent-night) dark:ring-offset-canvas-night dark:peer-checked:ring-(--accent-night)"
				></span>
				{labels[accent]()}
			</label>
		{/each}
	</div>
</fieldset>
