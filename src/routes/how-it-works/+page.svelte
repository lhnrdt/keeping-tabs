<script lang="ts">
	// How the app works, in a few plain words (#84): no account, joining a group, and keeping your
	// groups when you change phones.
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import { m } from '#lib/paraglide/messages.js';

	const sections = [
		{ title: m.how_no_account_title, text: m.how_no_account_text },
		{ title: m.how_joining_title, text: m.how_joining_text },
		{ title: m.how_splitting_title, text: m.how_splitting_text },
		{ title: m.how_private_title, text: m.how_private_text },
		{ title: m.how_devices_title, text: m.how_devices_text }
	];
</script>

<svelte:head>
	<title>{m.how_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.how_title()} back={{ href: resolve('/'), label: m.app_name() }}>
	<div class="page-sections">
		{#each sections as section (section.title)}
			<section class="flex flex-col gap-1">
				<h2 class="font-semibold">{section.title()}</h2>
				<p class="text-sm text-muted">{section.text()}</p>
			</section>
		{/each}
		<a
			href={resolve('/you/backup')}
			class="self-start text-sm font-medium text-accent dark:text-accent-night"
		>
			{m.how_devices_link()}
		</a>
	</div>
</AppPage>
