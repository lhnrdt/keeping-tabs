<script lang="ts">
	// Navbar entry to your profile (#146): your avatar and name, or a plain icon until you
	// have a name. Styled like the group's identity button.
	import { resolve } from '$app/paths';
	import Avatar from '#lib/components/Avatar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { me }: { me: { id: string; name: string | null } | null } = $props();
</script>

<a
	href={resolve('/you')}
	aria-label={m.you_title()}
	class="k-link inline-flex h-full max-h-12 items-center justify-center gap-1 px-4 duration-300 select-none active:opacity-50"
>
	{#if me?.name}
		<Avatar id={me.id} name={me.name} size="sm" />
		{me.name}
	{:else}
		<Icon name="identity" />
	{/if}
</a>
