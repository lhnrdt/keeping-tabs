<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import CreateGroupForm from '#lib/components/home/CreateGroupForm.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.create_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.create_title()} back={{ href: resolve('/'), label: m.app_name() }}>
	<CreateGroupForm
		currencies={data.currencies}
		defaultCurrency={data.defaultCurrency}
		values={form?.values}
		error={form?.error}
		profileName={data.profileName}
	/>
</AppPage>
