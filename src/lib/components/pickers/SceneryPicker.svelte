<script lang="ts">
	// Choose the scenery in the app's headers (#60, #332): each a round icon (its home scene) in
	// the colours in use, or a different one every day.
	import Icon from '#lib/components/Icon.svelte';
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
	<div class="grid grid-cols-5 gap-x-1 gap-y-3">
		{#each SCENERIES as scenery (scenery)}
			<label class="flex cursor-pointer flex-col items-center gap-1.5">
				<input
					class="peer sr-only"
					type="radio"
					name="scenery"
					value={scenery}
					checked={scenery === value}
				/>
				<span
					class="relative size-14 rounded-full ring-accent ring-offset-2 ring-offset-canvas peer-checked:ring-2 peer-focus-visible:ring-2 dark:ring-accent-night dark:ring-offset-canvas-night"
				>
					<span class="absolute inset-0 overflow-hidden rounded-full bg-(--tint-bg) tint-theme">
						<!-- The scene's right half, where its subject stands -->
						<span class="absolute inset-y-0 right-0 w-[250%]">
							<ThemePattern kind="home" themeId={scenery === DAILY ? today : scenery} />
						</span>
					</span>
					{#if scenery === DAILY}
						<span
							class="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-surface text-ink shadow-sm dark:bg-surface-night dark:text-ink-night"
						>
							<Icon name="day" size={14} />
						</span>
					{/if}
				</span>
				<span class="text-center text-xs leading-tight text-ink dark:text-ink-night">
					{scenery === DAILY ? m.scenery_daily() : themeLabels[scenery]()}
				</span>
			</label>
		{/each}
	</div>
</fieldset>
