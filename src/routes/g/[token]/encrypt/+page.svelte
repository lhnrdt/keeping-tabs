<script lang="ts">
	// A new link for an encrypted group (#110): everything sealed under a new key, so whoever had the
	// old link can't follow what's added from now on.
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import LinkField from '#lib/components/LinkField.svelte';
	import StickySubmit from '#lib/components/StickySubmit.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import { linkWithKey } from '#lib/crypto/keyring.ts';
	import { encryptGroup } from '#lib/crypto/encrypt-group.ts';
	import { categorize } from '#lib/expense/categorize.ts';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const base = $derived(resolve('/g/[token]', { token: data.group.shareToken }));
	let progress = $state<{ done: number; total: number }>();
	let failed = $state(false);
	let link = $state<string>();
	// This takes the browser: before the page is ready, pressing the button would only reload it
	let ready = $state(false);
	onMount(() => (ready = true));
	const heading = m.regenerate_link();

	async function start() {
		failed = false;
		progress = { done: 0, total: 1 };
		try {
			const { key, token } = await encryptGroup(
				base,
				data.group.keyId,
				categorize,
				(done, total) => (progress = { done, total })
			);
			const now = token ? resolve('/g/[token]', { token }) : base;
			link = linkWithKey(new URL(now, page.url.origin).href, key);
			if (token) await goto(resolve('/g/[token]/encrypt', { token }), { replaceState: true });
			else await invalidateAll();
		} catch {
			failed = true;
		} finally {
			progress = undefined;
		}
	}
</script>

<svelte:head>
	<title>{heading}</title>
</svelte:head>

<AppPage title={heading} back={{ href: groupTabUrl(base, 'group'), label: data.group.name }}>
	<div class="page-sections">
		{#if link}
			<div class="page-section" role="status">
				<p class="font-medium">{m.encrypt_done()}</p>
				<LinkField {link} label={m.share_title()} />
			</div>
		{:else}
			<div class="page-section">
				<p>{m.rekey_intro()}</p>
				<p class="text-sm text-muted">{m.rekey_warning()}</p>
				{#if failed}<p class="text-sm tone-destructive" role="alert">{m.encrypt_failed()}</p>{/if}
				{#if progress}
					<p class="text-sm text-muted" role="status">
						{m.encrypt_working({ done: progress.done, total: progress.total })}
					</p>
				{/if}
			</div>
		{/if}
	</div>
	{#if !link}
		<form
			onsubmit={(event) => {
				event.preventDefault();
				void start();
			}}
		>
			<StickySubmit>
				<SubmitButton pending={progress !== undefined} disabled={!ready}
					>{m.rekey_button()}</SubmitButton
				>
			</StickySubmit>
		</form>
	{/if}
</AppPage>
