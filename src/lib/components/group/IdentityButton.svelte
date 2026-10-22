<script lang="ts">
	// Navbar entry showing who you are; tap to switch (A-5).
	import { Link } from 'konsta/svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';

	const identity = useIdentity();
</script>

<Link
	component="button"
	type="button"
	data-testid="identity"
	aria-label={identity.me ? `${identity.me.name} – ${m.choose_member()}` : m.choose_member()}
	onclick={() => (identity.switching = true)}
>
	{#if identity.me}
		<Avatar id={identity.me.avatarId} name={identity.me.name} size="sm" />
	{:else}
		<Icon name="identity" />
	{/if}
	{identity.me?.name ?? m.who_are_you()}
</Link>
