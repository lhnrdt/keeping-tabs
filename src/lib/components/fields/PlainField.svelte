<script lang="ts">
	// A small label above a soft well (styles/form.css), for forms without cards. The control
	// inside gets the label's id; an icon can lead the well, a select gets its arrow.
	import type { Snippet } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { IconName } from '#lib/icons.ts';

	type Props = {
		label: string;
		icon?: IconName;
		/** Draws a dropdown arrow at the end, for a select */
		arrow?: boolean;
		/** The control, given the id its label points to */
		children: Snippet<[string]>;
		/** Below the well, e.g. a hint */
		below?: Snippet;
		class?: string;
	};

	let { label, icon, arrow = false, children, below, class: className = '' }: Props = $props();
	const id = $props.id();
</script>

<div class="flex min-w-0 flex-col gap-1.5 {className}">
	<label for={id} class="field-label">{label}</label>
	<div class="field-well">
		{#if icon}<span class="field-icon"><Icon name={icon} size={18} /></span>{/if}
		{@render children(id)}
		{#if arrow}<span class="field-arrow"><Icon name="expand" size={16} /></span>{/if}
	</div>
	{@render below?.()}
</div>
