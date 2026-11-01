<script lang="ts">
	// One line of the settings that leads somewhere, saying what's there right now.
	import type { Snippet } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { IconName } from '#lib/icons.ts';

	type Props = {
		href: string;
		title: string;
		icon?: IconName;
		/** Its current state, e.g. "2 devices" */
		value?: string;
		/** In front of the title instead of an icon */
		media?: Snippet;
		/** After the value, e.g. a dot */
		after?: Snippet;
	};

	let { href, title, icon, value, media, after }: Props = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- resolved by the caller -->
<a
	{href}
	class="field-well min-h-14 gap-3 px-3.5 transition-[transform,opacity] duration-150 active:scale-[0.99] active:opacity-70"
>
	{#if media}{@render media()}{:else if icon}<span class="flex-none opacity-65"
			><Icon name={icon} size={20} /></span
		>{/if}
	<span class="min-w-0 flex-1 truncate font-medium">{title}</span>
	{#if value}<span class="flex-none text-sm text-muted">{value}</span>{/if}
	{@render after?.()}
	<span class="flex-none opacity-50" aria-hidden="true"><Icon name="next" size={18} /></span>
</a>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
