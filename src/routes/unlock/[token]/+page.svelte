<script lang="ts">
	// Asks for a group's password (A-9); on this device only once.
	import { Block } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Field from '#lib/components/Field.svelte';
	import ThemeMotif from '#lib/components/illustrations/ThemeMotif.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.group_password_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.app_name()}>
	<div class="flex flex-col items-center gap-3 px-6 pt-10 pb-4 text-center">
		<ThemeMotif moment="locked" />
		<h1 class="font-display text-3xl font-semibold">{m.group_password_title()}</h1>
		<p class="max-w-sm text-muted">{m.group_password_intro()}</p>
	</div>
	<form method="POST">
		<div class="page-section mx-4 my-4">
			<Field
				label={m.field_group_password()}
				name="password"
				type="password"
				required
				autocomplete="current-password"
			/>
		</div>
		{#if form?.wrong}
			<Block class="!my-2">
				<p role="alert" class="text-sm tone-destructive">{m.group_password_wrong()}</p>
			</Block>
		{/if}
		<Block><SubmitButton>{m.group_password_enter()}</SubmitButton></Block>
	</form>
</AppPage>
