<script lang="ts">
	import { resolve } from '$app/paths';
	import { Block, List, ListItem } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import LinkButton from '#lib/components/LinkButton.svelte';
	import HomeHero from '#lib/components/home/HomeHero.svelte';
	import YourGroups from '#lib/components/home/YourGroups.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.app_name()}</title>
</svelte:head>

<AppPage title={m.app_name()}>
	{#snippet hero()}
		<HomeHero />
	{/snippet}
	<YourGroups memberOf={data.yourGroups} />
	<Block>
		<LinkButton href={resolve('/new')}>
			<Icon name="add" />
			{m.new_group()}
		</LinkButton>
	</Block>
	<List strong inset>
		<ListItem link title={m.home_other_device()} href={resolve('/device')} />
	</List>
</AppPage>
