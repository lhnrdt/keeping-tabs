<script lang="ts">
	// Navbar entry to your settings: your avatar and name, or the settings icon until you have one.
	import { resolve } from '$app/paths';
	import Avatar from '#lib/components/Avatar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';

	type Props = { me: { avatarId: string; name: string; avatar: string | null } | null };

	let { me }: Props = $props();
</script>

<a
	href={resolve('/you')}
	data-tour="profile"
	aria-label={me ? undefined : m.settings_title()}
	class="k-link inline-flex h-full max-h-12 items-center justify-center gap-1 px-4 duration-300 select-none active:opacity-50"
>
	{#if me}
		<Avatar id={me.avatarId} name={me.name} avatar={me.avatar} size="sm" />
		{me.name}
	{:else}
		<Icon name="settings" />
	{/if}
</a>
