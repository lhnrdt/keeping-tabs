<script lang="ts">
	// Per-group client state shared by all screens of one group.
	import type { Snippet } from 'svelte';
	import { rememberGroup } from '#lib/device.ts';
	import { Identity, provideIdentity } from '#lib/group/identity.svelte.ts';
	import type { GroupMember } from '#lib/group/members.ts';

	type Props = {
		group: { id: string; name: string; shareToken: string };
		members: GroupMember[];
		children: Snippet;
	};

	let { group, members, children }: Props = $props();

	provideIdentity(new Identity(() => members));

	$effect(() => {
		rememberGroup({ id: group.id, token: group.shareToken, name: group.name });
	});
</script>

{@render children()}
