<script lang="ts">
	// Calm error and not-found pages in the app's look, with a way back.
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Block } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Hills from '#lib/components/illustrations/Hills.svelte';
	import LinkButton from '#lib/components/LinkButton.svelte';
	import { m } from '#lib/paraglide/messages.js';

	const notFound = $derived(page.status === 404);
	const heading = $derived(notFound ? m.error_not_found_title() : m.error_title());
	// Messages from our own errors are written for people; others get a friendly default
	const message = $derived(
		page.status < 500 && page.error?.message ? page.error.message : m.error_unexpected()
	);
</script>

<svelte:head>
	<title>{heading} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.app_name()}>
	<div class="flex flex-col items-center gap-3 px-6 pt-10 pb-6 text-center" role="alert">
		<span class="text-sage dark:text-forest-night"><Hills /></span>
		<h1 class="font-display text-3xl font-semibold">{heading}</h1>
		<p class="max-w-sm text-muted">{message}</p>
	</div>
	<Block class="space-y-2">
		<LinkButton href={resolve('/')}>{m.back_home()}</LinkButton>
		{#if !notFound}
			<button
				type="button"
				class="flex h-12 w-full items-center justify-center rounded-full font-semibold text-forest dark:text-forest-night"
				onclick={() => location.reload()}
			>
				{m.try_again()}
			</button>
		{/if}
	</Block>
</AppPage>
