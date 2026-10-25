<script lang="ts">
	// Quick choices for two people (#40): one tap for who paid and how it's split, the form's
	// payer and participants as hidden fields. "More options" opens the full form.
	import { Block } from 'konsta/svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { PRESETS, presetValues, type Preset } from '#lib/split/presets.ts';

	type Props = {
		me: string;
		other: { id: string; name: string };
		preset: Preset;
		onMore: () => void;
	};

	let { me, other, preset = $bindable(), onMore }: Props = $props();

	const values = $derived(presetValues(preset, { me, other: other.id }));
	const labels: Record<Preset, () => string> = {
		iSplit: () => m.preset_i_split(),
		iFull: () => m.preset_i_full({ name: other.name }),
		theySplit: () => m.preset_they_split({ name: other.name }),
		theyFull: () => m.preset_they_full({ name: other.name })
	};
</script>

<input type="hidden" name="paidBy" value={values.paidBy} />
<input type="hidden" name="splitMode" value="equal" />
{#each values.participants as id (id)}
	<input type="hidden" name="participants" value={id} />
{/each}

<Block strong inset class="!px-0 !py-1">
	<fieldset>
		<legend class="sr-only">{m.field_split()}</legend>
		{#each PRESETS as option (option)}
			<label
				class="flex cursor-pointer items-center gap-3 px-4 py-3 has-focus-visible:ring-2 has-focus-visible:ring-inset"
			>
				<input
					type="radio"
					bind:group={preset}
					value={option}
					class="h-5 w-5 shrink-0 accent-accent dark:accent-accent-night"
				/>
				<span>{labels[option]()}</span>
			</label>
		{/each}
	</fieldset>
</Block>
<Block class="!-mt-4 !mb-2">
	<button
		type="button"
		class="text-sm font-medium text-accent dark:text-accent-night"
		onclick={onMore}>{m.preset_more()}</button
	>
</Block>
