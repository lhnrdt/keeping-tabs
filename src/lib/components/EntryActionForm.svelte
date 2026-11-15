<script lang="ts">
	// An entry's action that's a form (#321, #323): sent in place, sealed for encrypted groups, with
	// the fields it needs; the button inside is whoever shows it (a sheet's or a swiped row's).
	// Without a connection, one that can wait is kept on the device and sent later (#347).
	import { enhance, type SubmitFunction } from '$app/forms';
	import type { Snippet } from 'svelte';
	import { sealing } from '#lib/crypto/seal-form.ts';
	import { keep } from '#lib/offline/outbox.ts';
	import { pendingId } from '#lib/offline/outbox.ts';
	import type { MenuItem } from './EntryMenu.svelte';

	type Props = { item: MenuItem; onDone: () => void; class?: string; children: Snippet };
	let { item, onDone, class: className, children }: Props = $props();

	/** The request never reached the server (no connection), as opposed to it saying no */
	const unreachable = (failure: unknown) => failure instanceof TypeError || !navigator.onLine;

	const submit: SubmitFunction =
		(input) =>
		async ({ result, update }) => {
			const offline = item.offline;
			if (offline && result.type === 'error' && unreachable(result.error)) {
				keep({
					id: pendingId(offline.kind, offline.target),
					kind: offline.kind,
					target: offline.target,
					token: offline.token,
					action: input.action.href,
					fields: [...input.formData].map(([name, value]) => [name, String(value)]),
					title: offline.title,
					amount: '',
					date: '',
					addedAt: Date.now()
				});
				onDone();
				return;
			}
			await update();
			onDone();
		};
</script>

<form
	class={className}
	method="POST"
	action={item.action}
	data-announce={item.announce}
	use:enhance={sealing([], submit)}
>
	{#each Object.entries(item.fields ?? {}) as [name, value] (name)}
		<input type="hidden" {name} {value} />
	{/each}
	{@render children()}
</form>
