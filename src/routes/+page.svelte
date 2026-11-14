<script lang="ts">
	import InstallCard from '#lib/components/install/InstallCard.svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { startTour } from '#lib/onboarding/run.ts';
	import { encryptGroup } from '#lib/crypto/encrypt-group.ts';
	import ListSkeleton from '#lib/components/skeleton/ListSkeleton.svelte';
	import BackupNudge from '#lib/components/home/BackupNudge.svelte';
	import { categorize } from '#lib/expense/categorize.ts';
	import { resolve } from '$app/paths';
	import { Block } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import LinkButton from '#lib/components/LinkButton.svelte';
	import HomeHero from '#lib/components/home/HomeHero.svelte';
	import ProfileButton from '#lib/components/home/ProfileButton.svelte';
	import RecentlyDeleted from '#lib/components/home/RecentlyDeleted.svelte';
	import YourGroups from '#lib/components/home/YourGroups.svelte';
	import { totalsByCurrency } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// Your groups from before encryption: encrypted from here too, one after the other (#110)
	let upgrading = false;
	$effect(() => {
		const waiting = data.yourGroups.filter((group) => group.encryptNow);
		if (upgrading || waiting.length === 0) return;
		upgrading = true;
		void (async () => {
			for (const { token } of waiting) {
				await encryptGroup(resolve('/g/[token]', { token }), null, categorize, () => {});
			}
			await invalidateAll();
		})()
			.catch(() => {})
			.finally(() => (upgrading = false));
	});

	// The first time here, once the friendly note is read: a short tour (#331)
	onMount(() => {
		if (!page.data.showNote) void startTour('home');
	});

	// Your menu (#156), opened from the navbar; rendered here, outside the bar
	const named = $derived(
		data.me?.name ? { avatarId: data.me.id, name: data.me.name, avatar: data.me.avatar } : null
	);
</script>

<svelte:head>
	<title>{m.app_name()}</title>
</svelte:head>

<AppPage title={m.app_name()}>
	{#snippet right()}
		<ProfileButton me={named} />
	{/snippet}
	{#snippet hero()}
		<HomeHero totals={totalsByCurrency(data.yourGroups)} />
	{/snippet}
	{#if data.opening}
		<ListSkeleton hero={false} rows={3} />
	{:else}
		<YourGroups memberOf={data.yourGroups} />
	{/if}
	<InstallCard />
	{#if data.needsBackup}<BackupNudge />{/if}
	<Block data-tour="new-group">
		<LinkButton href={resolve('/new')}>
			<Icon name="add" />
			{m.new_group()}
		</LinkButton>
	</Block>
	<RecentlyDeleted groups={data.recentlyDeleted} error={form?.error} />
	<p class="my-2 text-center text-sm">
		<a
			class="font-medium text-accent dark:text-accent-night"
			href={resolve('/how-it-works')}
			data-tour="how-it-works">{m.how_title()}</a
		>
	</p>
</AppPage>
