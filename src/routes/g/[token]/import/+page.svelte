<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import ImportForm from '#lib/components/import/ImportForm.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.import_title()} – {data.group.name}</title>
</svelte:head>

<AppPage
	title={m.import_title()}
	back={{
		href: `${resolve('/g/[token]', { token: data.group.shareToken })}?tab=group`,
		label: data.group.name
	}}
>
	<ImportForm members={data.members} currency={data.group.currency} error={form?.error} />
</AppPage>
