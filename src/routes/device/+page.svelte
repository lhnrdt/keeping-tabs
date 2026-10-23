<script lang="ts">
	import { resolve } from '$app/paths';
	import { Block, BlockTitle } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import DeleteIdentity from '#lib/components/device/DeleteIdentity.svelte';
	import DeviceLinkCreator from '#lib/components/device/DeviceLinkCreator.svelte';
	import PasskeyRestore from '#lib/components/device/PasskeyRestore.svelte';
	import PasskeySave from '#lib/components/device/PasskeySave.svelte';
	import RecoveryKeyCreator from '#lib/components/device/RecoveryKeyCreator.svelte';
	import RestoreForm from '#lib/components/device/RestoreForm.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.identity_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.identity_title()} back={{ href: resolve('/'), label: m.app_name() }}>
	{#if data.hasIdentity}
		<BlockTitle>{m.passkey_title()}</BlockTitle>
		<Block><p class="opacity-80">{m.passkey_intro()}</p></Block>
		<PasskeySave count={data.passkeyCount} />

		<BlockTitle>{m.device_title()}</BlockTitle>
		<Block><p class="opacity-80">{m.device_intro()}</p></Block>
		<DeviceLinkCreator link={form && 'link' in form ? form.link : undefined} />

		<BlockTitle>{m.recovery_title()}</BlockTitle>
		<Block><p class="opacity-80">{m.recovery_intro()}</p></Block>
		<RecoveryKeyCreator
			recoveryKey={form && 'recoveryKey' in form ? form.recoveryKey : undefined}
		/>

		<BlockTitle>{m.delete_identity_title()}</BlockTitle>
		<Block><p class="opacity-80">{m.delete_identity_intro()}</p></Block>
		<DeleteIdentity />
	{/if}

	<BlockTitle>{m.restore_title()}</BlockTitle>
	<Block><p class="opacity-80">{m.restore_intro()}</p></Block>
	<PasskeyRestore />
	<RestoreForm
		error={form && 'error' in form ? form.error : undefined}
		restored={form && 'restored' in form ? form.restored : undefined}
	/>
</AppPage>
