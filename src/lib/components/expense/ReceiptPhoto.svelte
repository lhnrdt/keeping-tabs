<script lang="ts">
	// One receipt photo. In an encrypted group it's fetched and opened here (#110), and shown
	// large in place, since the browser can't open it as an address of its own.
	import { page } from '$app/state';
	import { keyFor } from '#lib/crypto/keyring.ts';
	import { openBytes, textContext, toBase64Url } from '#lib/crypto/seal.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { url, alt }: { url: string; alt: string } = $props();

	const keyId = $derived<string | null>(page.data.group?.keyId ?? null);
	let opened = $state<string>();
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!keyId) return;
		void (async () => {
			const key = await keyFor(keyId);
			if (!key) return;
			// Not from the browser's cache: it may hold the photo from before the group was encrypted
			const response = await fetch(url, { cache: 'no-cache' });
			const expenseId = /\/expenses\/([^/]+)/.exec(url)?.[1] ?? '';
			const bytes = await openBytes(
				key,
				new Uint8Array(await response.arrayBuffer()),
				textContext('photo', expenseId)
			);
			const base64 = toBase64Url(bytes).replace(/-/g, '+').replace(/_/g, '/');
			opened = `data:image/jpeg;base64,${base64}`;
		})().catch(() => {});
	});
</script>

{#if keyId}
	<button
		type="button"
		class="block aspect-square w-full overflow-hidden rounded-xl bg-current/[0.07]"
		aria-label={alt}
		onclick={() => dialog?.showModal()}
	>
		{#if opened}<img src={opened} {alt} class="size-full object-cover" />{/if}
	</button>
	<dialog
		bind:this={dialog}
		class="m-auto max-h-full max-w-full bg-transparent backdrop:bg-black/80"
		onclick={() => dialog?.close()}
		aria-label={alt}
	>
		{#if opened}<img src={opened} alt="" class="max-h-[90dvh] max-w-full" />{/if}
		<form method="dialog" class="text-center">
			<button class="min-h-11 text-white">{m.close()}</button>
		</form>
	</dialog>
{:else}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- resolved by the caller -->
	<a
		href={url}
		target="_blank"
		rel="noopener"
		data-sveltekit-reload
		class="block aspect-square overflow-hidden rounded-xl"
	>
		<img src={url} {alt} loading="lazy" class="size-full object-cover" />
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{/if}
