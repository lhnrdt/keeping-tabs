<script lang="ts">
	// An encrypted group this device has no key for (#110): the text can't be read until the
	// full link, with its key, has been opened here. Pasting it does the same.
	import { invalidateAll } from '$app/navigation';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import ThemeMotif from '#lib/components/illustrations/ThemeMotif.svelte';
	import { isKey } from '#lib/crypto/seal.ts';
	import { rememberKey } from '#lib/crypto/keyring.ts';
	import { syncKeys } from '#lib/crypto/vault.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { keyId }: { keyId: string } = $props();

	let wrong = $state(false);

	async function pasted(event: Event & { currentTarget: HTMLInputElement }) {
		const key = /key=([\w-]{43})/.exec(event.currentTarget.value)?.[1];
		if (!isKey(key) || (await rememberKey(key)) !== keyId) {
			wrong = true;
			return;
		}
		wrong = false;
		await syncKeys().catch(() => {});
		await invalidateAll();
	}
</script>

<div class="mx-4 mt-2 flex flex-col gap-2 rounded-xl bg-current/[0.07] p-3.5" role="status">
	<div class="self-center"><ThemeMotif moment="locked" /></div>
	<p class="font-medium">{m.locked_title()}</p>
	<p class="text-sm text-muted">{m.locked_intro()}</p>
	<PlainField label={m.locked_paste()}>
		{#snippet children(id)}
			<input {id} autocomplete="off" oninput={pasted} />
		{/snippet}
		{#snippet below()}
			{#if wrong}<p class="text-sm tone-destructive" role="alert">{m.locked_wrong()}</p>{/if}
		{/snippet}
	</PlainField>
</div>
