<script lang="ts">
	// An entry's action that's a form (#321, #323): sent in place, sealed for encrypted groups, with
	// the fields it needs; the button inside is whoever shows it (a sheet's or a swiped row's).
	import { enhance } from '$app/forms';
	import type { Snippet } from 'svelte';
	import { sealing } from '#lib/crypto/seal-form.ts';
	import type { MenuItem } from './EntryMenu.svelte';

	type Props = { item: MenuItem; onDone: () => void; class?: string; children: Snippet };
	let { item, onDone, class: className, children }: Props = $props();
</script>

<form
	class={className}
	method="POST"
	action={item.action}
	data-announce={item.announce}
	use:enhance={sealing([], () => {
		onDone();
	})}
>
	{#each Object.entries(item.fields ?? {}) as [name, value] (name)}
		<input type="hidden" {name} {value} />
	{/each}
	{@render children()}
</form>
