<script lang="ts">
	// How you get back if every device is gone: a passkey, a recovery key.
	import { resolve } from '$app/paths';
	import { Block } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Fold from '#lib/components/Fold.svelte';
	import PasskeySave from '#lib/components/device/PasskeySave.svelte';
	import RecoveryKeyCreator from '#lib/components/device/RecoveryKeyCreator.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.backup_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.backup_title()} back={{ href: resolve('/you'), label: m.settings_title() }}>
	<div class="pt-2">
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
			open={Boolean(form?.recoveryKey)}
		>
			<Block class="!my-2"><p class="text-sm text-muted">{m.recovery_intro()}</p></Block>
			<RecoveryKeyCreator recoveryKey={form?.recoveryKey} />
		</Fold>
	</div>
</AppPage>
