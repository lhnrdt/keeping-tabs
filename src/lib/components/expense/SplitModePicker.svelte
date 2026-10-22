<script lang="ts">
	// How the expense is split: a segmented row of radio buttons, so it works without JS too.
	import { m } from '#lib/paraglide/messages.js';
	import { SPLIT_MODES, type SplitMode } from '#lib/split/modes.ts';

	let { mode = $bindable() }: { mode: SplitMode } = $props();

	const labels: Record<SplitMode, () => string> = {
		equal: m.split_equal,
		exact: m.split_exact,
		percent: m.split_percent,
		shares: m.split_shares,
		adjust: m.split_adjust
	};
</script>

<fieldset class="mx-4 mt-3 mb-4">
	<legend class="sr-only">{m.field_split()}</legend>
	<div class="flex rounded-full bg-surface-muted p-1 dark:bg-surface-muted-night">
		{#each SPLIT_MODES as option (option)}
			<label
				class="relative flex-1 cursor-pointer rounded-full px-1 py-1.5 text-center text-xs font-medium transition-colors has-checked:bg-canvas has-checked:shadow-sm has-focus-visible:ring-2 dark:has-checked:bg-canvas-night"
			>
				<input class="sr-only" type="radio" name="splitMode" value={option} bind:group={mode} />
				{labels[option]()}
			</label>
		{/each}
	</div>
</fieldset>
