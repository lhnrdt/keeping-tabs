<script lang="ts">
	// Who owes you and whom you owe, across your groups (#117), opened from the start screen's
	// overall balance.
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import PeopleSummary from '#lib/components/home/PeopleSummary.svelte';
	import YourBalance from '#lib/components/YourBalance.svelte';
	import { totalsByCurrency } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.between_you_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.between_you_title()} back={{ href: resolve('/'), label: m.app_name() }}>
	{#if data.people.length}
		<!-- As on the start screen: overall, then by person -->
		<div class="px-4 pt-4 pb-1 text-lg font-semibold">
			{#each totalsByCurrency(data.people.map( ({ currency, net }) => ({ currency, balance: net }) )) as total (total.currency)}
				<p><YourBalance amount={total.amount} currency={total.currency} /></p>
			{/each}
		</div>
		<PeopleSummary people={data.people} />
	{:else}
		<EmptyState illustration="hills" text={m.between_you_settled()} role="status" />
	{/if}
</AppPage>
