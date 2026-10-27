<script lang="ts">
	// What's new (#212): what changed in each version, in plain words, newest first. Reading
	// it clears the dot on its link.
	import { version } from '$app/env';
	import { resolve } from '$app/paths';
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import { onMount } from 'svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import { CHANGELOG } from '#lib/changelog/entries.ts';
	import { visibleEntries } from '#lib/changelog/visible.ts';
	import { setSeenChangelog } from '#lib/device.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	const entries = visibleEntries(CHANGELOG, version);
	const german = getLocale().startsWith('de');
	// Staging and development show the coming version's lines ahead of its release
	const testBuild = version.includes('-');
	const released = (date: string) =>
		new Intl.DateTimeFormat(getLocale(), { dateStyle: 'long', timeZone: 'UTC' }).format(
			new Date(`${date}T00:00:00Z`)
		);

	onMount(() => {
		if (entries[0]) setSeenChangelog(entries[0].version);
	});
</script>

<svelte:head>
	<title>{m.whats_new_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.whats_new_title()} back={{ href: resolve('/you'), label: m.you_title() }}>
	{#each entries as entry (entry.version)}
		<section aria-labelledby="version-{entry.version}">
			<BlockTitle id="version-{entry.version}" class="!mb-2">
				{m.whats_new_version({ version: entry.version })}
				<span class="text-sm font-normal text-muted">
					{entry.date ? released(entry.date) : testBuild ? m.whats_new_coming() : ''}
				</span>
			</BlockTitle>
			<List strong inset class="!mt-0">
				{#each entry.items as item, i (i)}
					<ListItem title={german ? item.de : item.en} titleWrapClass="whitespace-normal" />
				{/each}
			</List>
		</section>
	{/each}
</AppPage>
