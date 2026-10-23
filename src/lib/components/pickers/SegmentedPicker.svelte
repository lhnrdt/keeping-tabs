<script lang="ts">
	// A short choice as a segmented row of radio buttons (works without JavaScript too).
	type Option = { value: string; label: string };

	type Props = { name: string; legend: string; options: Option[]; value: string };

	let { name, legend, options, value = $bindable() }: Props = $props();
</script>

<fieldset class="mx-4 mt-3 mb-4">
	<legend class="sr-only">{legend}</legend>
	<div class="flex rounded-full bg-surface-muted p-1 dark:bg-surface-muted-night">
		{#each options as option (option.value)}
			<label
				class="relative flex-1 cursor-pointer rounded-full px-1 py-1.5 text-center text-xs font-medium transition-colors has-checked:bg-canvas has-checked:shadow-sm has-focus-visible:ring-2 dark:has-checked:bg-canvas-night"
			>
				<input class="sr-only" type="radio" {name} value={option.value} bind:group={value} />
				{option.label}
			</label>
		{/each}
	</div>
</fieldset>
