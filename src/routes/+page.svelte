<script lang="ts">
	import AppPage from '#lib/components/AppPage.svelte';
	import HomeHero from '#lib/components/home/HomeHero.svelte';
	import CreateGroupForm from '#lib/components/home/CreateGroupForm.svelte';
	import RecentGroups from '#lib/components/home/RecentGroups.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.app_name()}</title>
</svelte:head>

<AppPage title={m.app_name()}>
	{#snippet hero()}
		<HomeHero />
	{/snippet}
	<RecentGroups />
	<CreateGroupForm
		currencies={data.currencies}
		defaultCurrency={data.defaultCurrency}
		values={form?.values}
		error={form?.error}
	/>
</AppPage>
