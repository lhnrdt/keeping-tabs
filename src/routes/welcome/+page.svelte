<script lang="ts">
	// The door of a private app among friends (#109): one shared password, once per device.
	import { Block, List } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Field from '#lib/components/Field.svelte';
	import Hills from '#lib/components/illustrations/Hills.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.app_name()}</title>
</svelte:head>

<AppPage title={m.app_name()}>
	<div class="flex flex-col items-center gap-3 px-6 pt-10 pb-4 text-center">
		<span class="text-accent-soft dark:text-accent-night"><Hills /></span>
		<h1 class="font-display text-3xl font-semibold">{m.welcome_title()}</h1>
		<p class="max-w-sm text-muted">{m.welcome_intro()}</p>
	</div>
	<form method="POST">
		<List strong inset>
			<Field
				label={m.welcome_password()}
				name="password"
				type="password"
				required
				autocomplete="current-password"
			/>
		</List>
		{#if form?.wrong}
			<Block class="!my-2">
				<p role="alert" class="text-sm tone-destructive">{m.welcome_wrong()}</p>
			</Block>
		{/if}
		<Block>
			<SubmitButton>{m.welcome_enter()}</SubmitButton>
			<p class="mt-4 text-center text-sm text-muted">{m.welcome_link_hint()}</p>
		</Block>
	</form>
</AppPage>
