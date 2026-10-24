<script lang="ts">
	// Navbar entry for you (#146, #156): your avatar and name, opening the menu for you (the
	// page renders it: inside the navbar a sheet would be placed relative to the bar). A plain
	// link to your profile without JavaScript, or until you have a name.
	import { resolve } from '$app/paths';
	import Avatar from '#lib/components/Avatar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		me: { avatarId: string; name: string; avatar: string | null } | null;
		onopen: () => void;
	};

	let { me, onopen }: Props = $props();
</script>

<a
	href={resolve('/you')}
	aria-label={me ? undefined : m.you_title()}
	class="k-link inline-flex h-full max-h-12 items-center justify-center gap-1 px-4 duration-300 select-none active:opacity-50"
	onclick={(event) => {
		if (!me) return;
		event.preventDefault();
		onopen();
	}}
>
	{#if me}
		<Avatar id={me.avatarId} name={me.name} avatar={me.avatar} size="sm" />
		{me.name}
	{:else}
		<Icon name="identity" />
	{/if}
</a>
