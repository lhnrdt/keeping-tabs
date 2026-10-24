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
		/** The person's chosen avatar (#61) */
		avatar?: string | null;
		/** "you", or "away": added but not joined yet */
		mark?: 'you' | 'away';
		onclick?: () => void;
		/** What the button does, for screen readers after the visible text, e.g. "options" */
		hint?: string;
		trailing?: Snippet;
	};

	let { name, avatarId, avatar, mark, onclick, hint, trailing }: Props = $props();

	const pill =
		'inline-flex min-h-11 items-center gap-2 rounded-full py-1 ps-1 pe-3 text-sm transition-colors';
	const look = $derived(
		mark === 'away'
			? 'border border-dashed border-ink-muted/50 bg-transparent dark:border-ink-night/40'
			: 'bg-surface dark:bg-surface-night shadow-[0_0_0_1px_rgb(37_40_34/0.08)] dark:shadow-[0_0_0_1px_rgb(236_237_232/0.08)]'
	);
</script>

{#snippet content()}
	<Avatar id={avatarId} {name} {avatar} size="sm" />
	<span class="font-medium">{name}</span>
	{#if mark === 'you'}
		<span class="rounded-full bg-accent-soft/50 px-2 text-xs dark:bg-accent-night/30"
			>{m.member_you()}</span
		>
	{:else if mark === 'away'}
		<span class="text-xs text-muted">{m.person_away()}</span>
	{/if}
	{@render trailing?.()}
{/snippet}

{#if onclick}
	<button
		type="button"
		class="{pill} {look} hover:bg-surface-muted focus-visible:ring-2 active:scale-[0.98] dark:hover:bg-surface-muted-night"
		{onclick}
	>
		{@render content()}
		<!-- Not an aria-label: the name must include the visible text (WCAG 2.5.3, #79) -->
		{#if hint}<span class="sr-only">, {hint}</span>{/if}
	</button>
{:else}
	<span class="{pill} {look}">{@render content()}</span>
{/if}
