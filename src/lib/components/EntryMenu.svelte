<script lang="ts" module>
	/** One thing to do with an entry: go somewhere, run something, or send a form action */
	export type MenuItem = {
		label: string;
		href?: string;
		onclick?: () => void;
		/** A form action to send, with these fields */
		action?: string;
		fields?: Record<string, string>;
		/** What to tell the group about once it's done (#267) */
		announce?: string;
		destructive?: boolean;
	};
</script>

<script lang="ts">
	// What you can do with an entry, from pressing and holding it: a sheet of actions, in the
	// app's look instead of the browser's own menu.
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Actions, ActionsButton, ActionsGroup, ActionsLabel } from 'konsta/svelte';
	import { sealing } from '#lib/crypto/seal-form.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		/** What it's about, at the top; the sheet is open while there's a title */
		title: string | null;
		items: MenuItem[];
		onClose: () => void;
	};

	let { title, items, onClose }: Props = $props();

	// Keeps the content while the sheet animates closed
	let shown = $state<{ title: string; items: MenuItem[] } | null>(null);
	$effect(() => {
		if (title) shown = { title, items };
	});

	function run(item: MenuItem) {
		onClose();
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved by whoever built the item
		if (item.href) void goto(item.href);
		else item.onclick?.();
	}
</script>

<Actions
	opened={title !== null}
	onBackdropClick={onClose}
	role="dialog"
	aria-modal="true"
	aria-label={shown?.title ?? ''}
>
	{#if shown}
		<ActionsGroup>
			<ActionsLabel>{shown.title}</ActionsLabel>
			{#each shown.items as item (item.label)}
				{#if item.action}
					<form
						method="POST"
						action={item.action}
						data-announce={item.announce}
						use:enhance={sealing([], () => {
							onClose();
						})}
					>
						{#each Object.entries(item.fields ?? {}) as [name, value] (name)}
							<input type="hidden" {name} {value} />
						{/each}
						<ActionsButton type="submit" class={item.destructive ? 'tone-destructive' : ''}
							>{item.label}</ActionsButton
						>
					</form>
				{:else}
					<ActionsButton
						type="button"
						class={item.destructive ? 'tone-destructive' : ''}
						onclick={() => run(item)}>{item.label}</ActionsButton
					>
				{/if}
			{/each}
		</ActionsGroup>
		<ActionsGroup>
			<ActionsButton type="button" onclick={onClose}>{m.cancel()}</ActionsButton>
		</ActionsGroup>
	{/if}
</Actions>
