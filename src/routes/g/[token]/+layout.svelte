<script lang="ts">
	import { page } from '$app/state';
	import GroupScope from '#lib/components/group/GroupScope.svelte';
	import { invalidateAll } from '$app/navigation';
	import LockedNotice from '#lib/components/group/LockedNotice.svelte';
	import { takeKeyFromAddress } from '#lib/crypto/key-from-address.ts';
	import { keyFor } from '#lib/crypto/keyring.ts';
	import { resolve } from '$app/paths';
	import { encryptGroup } from '#lib/crypto/encrypt-group.ts';
	import { paymentCopies } from '#lib/crypto/profile.ts';
	import { categorize } from '#lib/expense/categorize.ts';
	import { syncKeys } from '#lib/crypto/vault.ts';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	/** Groups being encrypted from this page: one run each, and another try once it's over */
	const encrypting: Record<string, boolean> = {};

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

	// A group from before encryption: the first of its people to come encrypts it, in the background,
	// and the others get the key with their next visit (#110). An interrupted run is picked up later
	$effect(() => {
		const groupId = data.group.id;
		if (!data.encryptNow || encrypting[groupId]) return;
		encrypting[groupId] = true;
		const base = resolve('/g/[token]', { token: data.group.shareToken });
		void encryptGroup(base, null, categorize, () => {})
			.then(() => invalidateAll())
			.catch(() => {})
			.finally(() => (encrypting[groupId] = false));
	});

	// The full link opened while already here: the browser stays on the page, so nothing loads
	async function hashChanged() {
		if (await takeKeyFromAddress()) await invalidateAll();
	}

	// How to pay you, this group's copy: for a group joined since, or changed since (#110)
	$effect(() => {
		const me = data.members.find((member) => member.mine);
		const details = data.myPaymentDetails;
		if (!me || !details || me.paymentDetails === details) return;
		void (async () => {
			const body = new FormData();
			const memberId = me.id;
			const copies = await paymentCopies(details, [{ memberId, keyId: data.group.keyId }]);
			body.set('copies', JSON.stringify(copies));
			await fetch(`${resolve('/you/profile')}?/paymentCopy`, {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body
			});
			await invalidateAll();
		})().catch(() => {});
	});

	// Errors from joining or stepping back (actions on the group page)
	const membershipError = $derived.by(() => {
		const form = page.form as { action?: string; error?: ErrorCode } | null;
		return form?.action === 'join' || form?.action === 'stepBack' ? form.error : undefined;
	});
</script>

<svelte:window onhashchange={hashChanged} />

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
