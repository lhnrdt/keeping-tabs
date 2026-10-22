<script lang="ts">
	// Choose what a group is for (SP-18): icon tiles backed by radio buttons.
	import Icon from '#lib/components/Icon.svelte';
	import { kindIcons, kindLabels } from '#lib/group/kind-style.ts';
	import { GROUP_KINDS } from '#lib/group/kinds.ts';
	import { m } from '#lib/paraglide/messages.js';

	/** value: the chosen kind, as submitted */
	let { value }: { value: string } = $props();
</script>

<fieldset class="px-4 pb-2">
	<legend class="mb-2 text-sm opacity-70">{m.field_group_kind()}</legend>
	<div class="grid grid-cols-4 gap-2">
		{#each GROUP_KINDS as kind (kind)}
			<label
				class="relative flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-transparent bg-surface-muted px-1 py-3 text-xs transition-colors has-checked:border-forest has-checked:bg-sage/40 has-focus-visible:ring-2 dark:bg-surface-muted-night dark:has-checked:border-forest-night"
			>
				<input class="sr-only" type="radio" name="kind" value={kind} checked={kind === value} />
				<Icon name={kindIcons[kind]} />
				<span class="text-center">{kindLabels[kind]()}</span>
			</label>
		{/each}
	</div>
</fieldset>
