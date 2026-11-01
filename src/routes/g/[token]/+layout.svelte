<script lang="ts">
	import { page } from '$app/state';
	import GroupScope from '#lib/components/group/GroupScope.svelte';
	import { invalidateAll } from '$app/navigation';
	import LockedNotice from '#lib/components/group/LockedNotice.svelte';
	import { keyFor } from '#lib/crypto/keyring.ts';
	import { syncKeys } from '#lib/crypto/vault.ts';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// An encrypted group this device can't read yet (#110)
	let locked = $state(false);
	$effect(() => {
		const keyId = data.group.keyId;
		if (!keyId) {
			locked = false;
			return;
		}
		void (async () => {
			const key = await keyFor(keyId);
			locked = !key;
			await syncKeys().catch(() => {});
			// Another device of yours had stored it: now it can be read here too
			if (!key && (await keyFor(keyId))) {
				locked = false;
				await invalidateAll();
			}
		})();
	});

	// Errors from joining or stepping back (actions on the group page)
	const membershipError = $derived.by(() => {
		const form = page.form as { action?: string; error?: ErrorCode } | null;
		return form?.action === 'join' || form?.action === 'stepBack' ? form.error : undefined;
	});
</script>

{#if locked && data.group.keyId}
	<LockedNotice keyId={data.group.keyId} />
{/if}
{#key data.group.id}
	<GroupScope
		group={data.group}
		members={data.members}
		canStepBack={data.canStepBack}
		profileName={data.profileName}
		error={membershipError}
	>
		{@render children()}
	</GroupScope>
{/key}
