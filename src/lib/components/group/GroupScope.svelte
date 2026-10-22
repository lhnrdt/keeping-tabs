<script lang="ts">
	// Per-group client state shared by all screens of one group.
	import type { Snippet } from 'svelte';
	import { rememberGroup } from '#lib/device.ts';
	import { Identity, provideIdentity } from '#lib/group/identity.svelte.ts';
	import type { GroupMember } from '#lib/group/members.ts';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import type { Tint } from '#lib/tints.ts';

	type Props = {
		group: { id: string; name: string; shareToken: string; kind: GroupKind; tint: Tint | null };
		members: GroupMember[];
		children: Snippet;
	};

	let { group, members, children }: Props = $props();

	provideIdentity(new Identity(() => members));

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

{@render children()}
