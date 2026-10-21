<script lang="ts">
	// Per-group client state shared by all screens of one group.
	import { onMount, type Snippet } from 'svelte';
	import { rememberGroup } from '#lib/device.ts';
	import { Identity, provideIdentity } from '#lib/group/identity.svelte.ts';

	type Props = {
		group: { id: string; name: string; shareToken: string };
		/** Set right after this device created the group */
		creatorId: string | null;
		children: Snippet;
	};

	let { group, creatorId, children }: Props = $props();

	// The parent re-creates this component per group ({#key}), so the id is fixed here
	// svelte-ignore state_referenced_locally
	const identity = provideIdentity(new Identity(group.id));

	onMount(() => {
		identity.load();
		if (!identity.memberId && creatorId) identity.choose(creatorId);
	});

	$effect(() => {
		rememberGroup({ id: group.id, token: group.shareToken, name: group.name });
	});
</script>

{@render children()}
