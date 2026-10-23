<script lang="ts">
	// Per-group client state shared by all screens of one group. Until you've joined, every
	// screen of the group is the join screen (A-4).
	import type { Snippet } from 'svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import JoinScreen from './JoinScreen.svelte';
	import YouSheet from './YouSheet.svelte';
	import { rememberGroup } from '#lib/device.ts';
	import { Identity, provideIdentity } from '#lib/group/identity.svelte.ts';
	import type { GroupMember } from '#lib/group/members.ts';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import type { Tint } from '#lib/tints.ts';

	type Props = {
		group: { id: string; name: string; shareToken: string; kind: GroupKind; tint: Tint | null };
		members: GroupMember[];
		canStepBack: boolean;
		profileName: string | null;
		/** From the last join or step back */
		error?: ErrorCode;
		children: Snippet;
	};

	let { group, members, canStepBack, profileName, error, children }: Props = $props();

	const identity = new Identity(
		() => members,
		() => canStepBack
	);
	provideIdentity(identity);

	$effect(() => {
		rememberGroup({
			id: group.id,
			token: group.shareToken,
			name: group.name,
			kind: group.kind,
			tint: group.tint
		});
	});
</script>

{#if identity.me}
	{@render children()}
	<YouSheet token={group.shareToken} {error} />
{:else}
	<JoinScreen {group} {members} {profileName} {error} />
{/if}
