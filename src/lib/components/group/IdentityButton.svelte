<script lang="ts">
	// Navbar entry showing who you are; tap to switch (A-5).
	import { Link } from 'konsta/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import type { Member } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { members }: { members: Member[] } = $props();

	const identity = useIdentity();
	const me = $derived(members.find((member) => member.id === identity.memberId));
</script>

{#if identity.ready}
	<Link
		component="button"
		type="button"
		data-testid="identity"
		aria-label={me ? `${me.name} – ${m.choose_member()}` : m.choose_member()}
		onclick={() => (identity.switching = true)}
	>
		<Icon name="identity" />
		{me?.name ?? m.who_are_you()}
	</Link>
{/if}
