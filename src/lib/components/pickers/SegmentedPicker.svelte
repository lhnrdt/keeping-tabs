<script lang="ts">
	// A short choice as a segmented row of radio buttons (works without JavaScript too).
	type Option = { value: string; label: string };

	type Props = { name: string; legend: string; options: Option[]; value: string };

	let { name, legend, options, value = $bindable() }: Props = $props();

	const chosen = $derived(options.findIndex((option) => option.value === value));
</script>

<fieldset>
	<legend class="sr-only">{legend}</legend>
	<div class="relative flex rounded-full bg-surface-muted p-1 dark:bg-surface-muted-night">
		<!-- The marker slides to what's chosen -->
		<span
			class="absolute inset-y-1 start-1 rounded-full bg-canvas shadow-sm transition-transform duration-300 ease-[var(--ease-calm)] motion-reduce:transition-none dark:bg-canvas-night"
			style:width={`calc((100% - 0.5rem) / ${options.length})`}
			style:transform={`translateX(${Math.max(0, chosen) * 100}%)`}
			aria-hidden="true"
		></span>
		{#each options as option (option.value)}
			<label
				class="relative flex-1 cursor-pointer rounded-full px-1 py-1.5 text-center text-xs font-medium has-focus-visible:ring-2"
			>
				<input class="sr-only" type="radio" {name} value={option.value} bind:group={value} />
				{option.label}
			</label>
		{/each}
	</div>
</fieldset>
