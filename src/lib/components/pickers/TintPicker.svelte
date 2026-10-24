<script lang="ts">
	// Choose a group's color: "Automatic" (derived from the group) or one of the tints.
	import { tintLabels } from '#lib/group/kind-style.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { groupTintClass, TINTS } from '#lib/tints.ts';

	/** The chosen tint, empty for automatic (the nature theme's, #60) */
	let { value }: { value: string } = $props();

	const swatch =
		'h-9 w-9 rounded-full border-2 border-transparent bg-(--tint-bg) peer-checked:border-accent peer-focus-visible:ring-2 dark:peer-checked:border-accent-night';
</script>

<fieldset class="px-4 pb-3">
	<legend class="mb-2 text-sm text-muted">{m.field_group_color()}</legend>
	<div class="flex flex-wrap gap-3">
		<label class="relative flex cursor-pointer flex-col items-center gap-1 text-xs">
			<input class="peer sr-only" type="radio" name="tint" value="" checked={!value} />
			<span class="{groupTintClass()} {swatch} grid place-items-center text-(--tint-fg)">A</span>
			{m.tint_auto()}
		</label>
		{#each TINTS as tint (tint)}
			<label class="relative flex cursor-pointer flex-col items-center gap-1 text-xs">
				<input
					class="peer sr-only"
					type="radio"
					name="tint"
					value={tint}
					checked={tint === value}
				/>
				<span class="{groupTintClass(tint)} {swatch}"></span>
				{tintLabels[tint]()}
			</label>
		{/each}
	</div>
</fieldset>
