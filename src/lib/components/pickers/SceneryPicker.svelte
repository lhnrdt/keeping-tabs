<script lang="ts">
	// Choose the scenery in the app's headers (#60, #332): each a small preview (its home scene) in
	// the colours in use, or a different one every day.
	import ThemePattern from '#lib/components/illustrations/ThemePattern.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { DAILY, SCENERIES, type Scenery } from '#lib/settings.ts';
	import type { ThemeId } from '#lib/themes/palettes.ts';
	import { themeLabels } from './theme-labels';

	type Props = {
		value: Scenery;
		/** Today's, which the daily choice shows */
		today: ThemeId;
	};
	let { value, today }: Props = $props();
</script>

<fieldset class="px-4">
	<legend class="sr-only">{m.settings_scenery()}</legend>
	<div class="grid grid-cols-2 gap-3">
		{#each SCENERIES as scenery (scenery)}
			<label class="cursor-pointer">
				<input
					class="peer sr-only"
					type="radio"
					name="scenery"
					value={scenery}
					checked={scenery === value}
				/>
				<span
					class="flex h-full flex-col gap-1.5 rounded-2xl border-2 border-transparent bg-surface p-1.5 peer-checked:border-accent peer-focus-visible:ring-2 dark:bg-surface-night dark:peer-checked:border-accent-night"
				>
					<span class="relative block h-16 overflow-hidden rounded-xl bg-(--tint-bg) tint-theme">
						<ThemePattern kind="home" themeId={scenery === DAILY ? today : scenery} />
					</span>
					<span class="text-center text-xs text-ink dark:text-ink-night">
						{scenery === DAILY ? m.scenery_daily() : themeLabels[scenery]()}
					</span>
				</span>
			</label>
		{/each}
	</div>
</fieldset>
