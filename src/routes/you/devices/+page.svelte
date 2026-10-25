<script lang="ts">
	import { resolve } from '$app/paths';
	import { Block, BlockTitle } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Fold from '#lib/components/Fold.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import DeviceList from '#lib/components/device/DeviceList.svelte';
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

<AppPage title={m.identity_title()} back={{ href: resolve('/you'), label: m.you_title() }}>
	{#if data.hasIdentity}
		<!-- 1. Your devices (#126), and adding one -->
		<BlockTitle>{m.devices_title()}</BlockTitle>
		<DeviceList devices={data.devices} />
		<FormError error={form && 'error' in form && !('restored' in form) ? form.error : undefined} />
		<Fold title={m.device_title()} open={Boolean(form && 'link' in form)}>
			<Block class="!my-2"><p class="text-sm text-muted">{m.device_intro()}</p></Block>
			<DeviceLinkCreator link={form && 'link' in form ? form.link : undefined} />
		</Fold>

		<!-- 2. Backup: how you get back if every device is gone -->
		<BlockTitle class="!mt-8">{m.backup_title()}</BlockTitle>
		<Fold
			title={m.passkey_title()}
			status={data.passkeyCount > 0 ? `✓ ${m.backup_saved()}` : m.backup_not_set_up()}
			done={data.passkeyCount > 0}
		>
			<Block class="!my-2"><p class="text-sm text-muted">{m.passkey_intro()}</p></Block>
			<PasskeySave count={data.passkeyCount} />
		</Fold>
		<Fold
			title={m.recovery_title()}
			status={data.hasRecoveryKey ? `✓ ${m.backup_saved()}` : m.backup_not_set_up()}
			done={data.hasRecoveryKey}
			open={Boolean(form && 'recoveryKey' in form)}
		>
			<Block class="!my-2"><p class="text-sm text-muted">{m.recovery_intro()}</p></Block>
			<RecoveryKeyCreator
				recoveryKey={form && 'recoveryKey' in form ? form.recoveryKey : undefined}
			/>
		</Fold>
	{/if}

	<!-- 3. Coming from another device: open while this one isn't you yet -->
	<div class="mt-6">
		<Fold
			title={m.restore_from_other()}
			open={!data.hasIdentity || Boolean(form && 'restored' in form)}
		>
			<Block class="!my-2"><p class="text-sm text-muted">{m.restore_intro()}</p></Block>
			<PasskeyRestore />
			<RestoreForm
				error={form && 'error' in form && !('link' in form) ? form.error : undefined}
				restored={form && 'restored' in form ? form.restored : undefined}
			/>
		</Fold>
	</div>
</AppPage>
