<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	const submission = new Submission();
</script>

<svelte:head>
	<title>{m.backup_restore_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.backup_restore_title()} back={{ href: resolve('/new'), label: m.create_title() }}>
	<form
		method="POST"
		enctype="multipart/form-data"
		class="page-sections"
		use:enhance={submission.enhance}
	>
		<p class="text-sm text-muted">{m.backup_restore_intro()}</p>
		<PlainField label={m.backup_file()}>
			{#snippet children(id)}
				<input {id} type="file" name="file" accept=".json,application/json" required class="py-3" />
			{/snippet}
		</PlainField>
		<FormError error={form?.error} />
		<SubmitButton pending={submission.pending}>{m.backup_restore_submit()}</SubmitButton>
	</form>
</AppPage>
