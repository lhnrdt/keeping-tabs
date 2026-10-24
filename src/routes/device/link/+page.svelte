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
		// Stays in the address until it's used: a new browser first meets the friendly note,
		// which brings it back here with the address it had. The link works only once anyway.
		token = location.hash.slice(1);
	});
</script>

<svelte:head>
	<title>{m.device_adopt_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.device_adopt_title()}>
	<Block><p class="text-muted">{m.device_adopt_intro()}</p></Block>
	<form method="POST" action="?/use" use:enhance={submission.enhance}>
		<input type="hidden" name="token" value={token} />
		<FormError error={form?.error} />
		<Block>
			<SubmitButton pending={submission.pending}>{m.device_adopt_button()}</SubmitButton>
		</Block>
	</form>
</AppPage>
