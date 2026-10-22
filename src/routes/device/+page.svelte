<script lang="ts">
	import { resolve } from '$app/paths';
	import { Block } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import DeviceLinkCreator from '#lib/components/device/DeviceLinkCreator.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.device_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.device_title()} back={{ href: resolve('/'), label: m.app_name() }}>
	<Block><p class="opacity-80">{m.device_intro()}</p></Block>
	{#if data.hasIdentity}
		<DeviceLinkCreator link={form?.link} />
	{:else}
		<Block><p class="opacity-70">{m.device_none()}</p></Block>
	{/if}
</AppPage>
