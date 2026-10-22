<script lang="ts">
	// Receives a one-time device link. The token is in the URL fragment, so it never reaches
	// server logs; it's read here and submitted with the form (needs JavaScript).
	import { enhance } from '$app/forms';
	import { Block } from 'konsta/svelte';
	import { onMount } from 'svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	const submission = new Submission();
	let token = $state('');

	onMount(() => {
		token = location.hash.slice(1);
		// Keep the secret out of the history and anything that shows the URL
		history.replaceState(history.state, '', location.pathname);
	});
</script>

<svelte:head>
	<title>{m.device_adopt_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.device_adopt_title()}>
	<Block><p class="opacity-80">{m.device_adopt_intro()}</p></Block>
	<form method="POST" action="?/use" use:enhance={submission.enhance}>
		<input type="hidden" name="token" value={token} />
		<FormError error={form?.error} />
		<Block>
			<SubmitButton pending={submission.pending}>{m.device_adopt_button()}</SubmitButton>
		</Block>
	</form>
</AppPage>
