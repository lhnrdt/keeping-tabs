<script lang="ts">
	// A person as a pill: avatar, name and whether it's you or they haven't joined yet.
	// A button when it does something (onclick), otherwise plain; `trailing` adds e.g. a ✕.
	import type { Snippet } from 'svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		name: string;
		/** For the avatar color; any stable id */
		avatarId: string;
		/** "you", or "away": added but not joined yet */
		mark?: 'you' | 'away';
		onclick?: () => void;
		/** Accessible label when it's a button */
		label?: string;
		trailing?: Snippet;
	};

	let { name, avatarId, mark, onclick, label, trailing }: Props = $props();

	const pill =
		'inline-flex min-h-11 items-center gap-2 rounded-full py-1 ps-1 pe-3 text-sm transition-colors';
	const look = $derived(
		mark === 'away'
			? 'border border-dashed border-ink-muted/50 bg-transparent dark:border-ink-night/40'
			: 'bg-surface dark:bg-surface-night shadow-[0_0_0_1px_rgb(37_40_34/0.08)] dark:shadow-[0_0_0_1px_rgb(236_237_232/0.08)]'
	);
</script>

{#snippet content()}
	<Avatar id={avatarId} {name} size="sm" />
	<span class="font-medium">{name}</span>
	{#if mark === 'you'}
		<span class="rounded-full bg-sage/50 px-2 text-xs dark:bg-forest-night/30"
			>{m.member_you()}</span
		>
	{:else if mark === 'away'}
		<span class="text-xs opacity-60">{m.person_away()}</span>
	{/if}
	{@render trailing?.()}
{/snippet}

{#if onclick}
	<button
		type="button"
		class="{pill} {look} hover:bg-surface-muted focus-visible:ring-2 active:scale-[0.98] dark:hover:bg-surface-muted-night"
		aria-label={label}
		{onclick}
	>
		{@render content()}
	</button>
{:else}
	<span class="{pill} {look}">{@render content()}</span>
{/if}
