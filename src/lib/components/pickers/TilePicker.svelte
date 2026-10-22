<script lang="ts">
	// A choice of icon tiles backed by radio buttons, e.g. a group's type or an expense's category.
	import Icon from '#lib/components/Icon.svelte';
	import type { IconName } from '#lib/icons.ts';

	type Option = { value: string; label: string; icon: IconName; hint?: string };

	/** value: the chosen option, as submitted */
	let {
		name,
		legend,
		value,
		options
	}: { name: string; legend: string; value: string; options: Option[] } = $props();
</script>

<fieldset class="px-4 pb-2">
	<legend class="mb-2 text-sm opacity-70">{legend}</legend>
	<div class="grid grid-cols-4 gap-2">
		{#each options as option (option.value)}
			<label
				class="relative flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-transparent bg-surface-muted px-1 py-3 text-xs transition-colors has-checked:border-forest has-checked:bg-sage/40 has-focus-visible:ring-2 dark:bg-surface-muted-night dark:has-checked:border-forest-night"
			>
				<input
					class="sr-only"
					type="radio"
					{name}
					value={option.value}
					checked={option.value === value}
				/>
				<Icon name={option.icon} />
				<span class="text-center">{option.label}</span>
				{#if option.hint}
					<span class="text-center text-[0.65rem] opacity-60">{option.hint}</span>
				{/if}
			</label>
		{/each}
	</div>
</fieldset>
