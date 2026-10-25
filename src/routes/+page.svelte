<script lang="ts">
	import { resolve } from '$app/paths';
	import { Block } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import LinkButton from '#lib/components/LinkButton.svelte';
	import HomeHero from '#lib/components/home/HomeHero.svelte';
	import ProfileButton from '#lib/components/home/ProfileButton.svelte';
	import YouMenu from '#lib/components/YouMenu.svelte';
	import RecentlyDeleted from '#lib/components/home/RecentlyDeleted.svelte';
	import YourGroups from '#lib/components/home/YourGroups.svelte';
	import { totalsByCurrency } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// Your menu (#156), opened from the navbar; rendered here, outside the bar
	let showingYou = $state(false);
	const named = $derived(
		data.me?.name ? { avatarId: data.me.id, name: data.me.name, avatar: data.me.avatar } : null
	);
</script>

<svelte:head>
	<title>{m.app_name()}</title>
</svelte:head>

<AppPage title={m.app_name()}>
	{#snippet right()}
		<ProfileButton me={named} onopen={() => (showingYou = true)} />
	{/snippet}
	{#snippet hero()}
		<HomeHero totals={totalsByCurrency(data.yourGroups)} />
	{/snippet}
	<YourGroups memberOf={data.yourGroups} />
	<Block>
		<LinkButton href={resolve('/new')}>
			<Icon name="add" />
			{m.new_group()}
		</LinkButton>
	</Block>
	<RecentlyDeleted groups={data.recentlyDeleted} error={form?.error} />
	{#if named}
		<YouMenu opened={showingYou} onClose={() => (showingYou = false)} me={named} />
	{/if}
</AppPage>
