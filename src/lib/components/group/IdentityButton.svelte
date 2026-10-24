<script lang="ts">
	// Navbar entry showing who you are in this group; opens a sheet explaining it. A plain
	// button styled like Konsta's navbar link, which would announce itself as a link.
	import Avatar from '#lib/components/Avatar.svelte';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';

	const identity = useIdentity();
</script>

{#if identity.me}
	<button
		type="button"
		data-testid="identity"
		aria-label={m.you_are({ name: identity.me.name })}
		class="k-link inline-flex h-full max-h-12 cursor-pointer items-center justify-center gap-1 px-4 duration-300 select-none active:opacity-50"
		onclick={() => (identity.showing = true)}
	>
		<Avatar
			id={identity.me.avatarId}
			name={identity.me.name}
			avatar={identity.me.avatar}
			size="sm"
		/>
		{identity.me.name}
	</button>
{/if}
