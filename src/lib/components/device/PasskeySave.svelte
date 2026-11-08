<script lang="ts">
	// Save a passkey so your platform can bring you back on any device (A-18).
	import { invalidateAll } from '$app/navigation';
	import { Block, Button, Preloader } from 'konsta/svelte';
	import { onMount } from 'svelte';
	import FormError from '#lib/components/FormError.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { passkeysSupported, savePasskey, sealVaultWithPasskey } from '#lib/passkeys.ts';
	import { vaultKey } from '#lib/crypto/keyring.ts';

	/** `withoutVault`: saved before they could bring the groups along (#298) */
	let { count, withoutVault = 0 }: { count: number; withoutVault?: number } = $props();

	let supported = $state(false);
	let pending = $state(false);
	let failed = $state(false);
	/** Only a device holding the vault can hand it to a passkey */
	let hasVault = $state(false);

	onMount(async () => {
		supported = passkeysSupported();
		hasVault = Boolean(await vaultKey());
	});

	async function bringAlong() {
		pending = true;
		failed = false;
		try {
			failed = !(await sealVaultWithPasskey());
			await invalidateAll();
		} catch {
			failed = true;
		} finally {
			pending = false;
		}
	}

	async function save() {
		pending = true;
		failed = false;
		try {
			await savePasskey();
			await invalidateAll();
		} catch {
			// Cancelled or not possible on this device
			failed = true;
		} finally {
			pending = false;
		}
	}
</script>

{#if supported}
	{#if count}
		<Block class="flex items-center gap-2 tone-positive" role="status">
			<Icon name="passkey" />
			{m.passkey_saved({ count })}
		</Block>
	{/if}
	{#if withoutVault > 0 && hasVault}
		<!-- One confirmation, and the passkey opens your groups on your other devices too -->
		<Block class="flex flex-col gap-2">
			<p class="text-sm">{m.passkey_bring_groups_hint()}</p>
			<Button large rounded type="button" class="gap-2" disabled={pending} onclick={bringAlong}>
				<Icon name="passkey" />
				{m.passkey_bring_groups()}
			</Button>
		</Block>
	{/if}
	<Block>
		<Button
			large
			rounded
			tonal={count > 0}
			type="button"
			class="gap-2"
			disabled={pending}
			onclick={save}
		>
			{#if pending}<Preloader class="h-5 w-5" />{:else}<Icon name="passkey" />{/if}
			{count ? m.passkey_save_another() : m.passkey_save()}
		</Button>
	</Block>
	{#if failed}<FormError error="passkey_failed" />{/if}
{:else}
	<Block><p class="text-sm text-muted">{m.passkey_unsupported()}</p></Block>
{/if}
