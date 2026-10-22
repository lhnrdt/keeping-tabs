<script lang="ts">
	import { page } from '$app/state';
	import GroupScope from '#lib/components/group/GroupScope.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// Errors from joining or stepping back (actions on the group page)
	const membershipError = $derived.by(() => {
		const form = page.form as { action?: string; error?: ErrorCode } | null;
		return form?.action === 'join' || form?.action === 'stepBack' ? form.error : undefined;
	});
</script>

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
