<script lang="ts">
	// How you get back if every device is gone: a passkey, a recovery key.
	import { resolve } from '$app/paths';
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
	<div class="page-sections">
		<Fold
			plain
			title={m.passkey_title()}
			status={data.passkeyCount > 0 ? `✓ ${m.backup_saved()}` : m.backup_not_set_up()}
			done={data.passkeyCount > 0}
		>
			<p class="text-sm text-muted">{m.passkey_intro()}</p>
			<PasskeySave count={data.passkeyCount} />
		</Fold>
		<Fold
			plain
			title={m.recovery_title()}
			status={data.recoveryKeyOutdated
				? m.recovery_status_outdated()
				: data.hasRecoveryKey
					? `✓ ${m.backup_saved()}`
					: m.backup_not_set_up()}
			done={data.hasRecoveryKey && !data.recoveryKeyOutdated}
			open={Boolean(form?.recoveryCreated) || data.recoveryKeyOutdated}
		>
			<p class="text-sm text-muted">{m.recovery_intro()}</p>
			{#if data.recoveryKeyOutdated}
				<p class="text-sm font-medium" role="status">{m.recovery_outdated()}</p>
			{/if}
			<RecoveryKeyCreator />
		</Fold>
	</div>
</AppPage>
