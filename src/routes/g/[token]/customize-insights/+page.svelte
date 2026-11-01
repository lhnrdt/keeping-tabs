<script lang="ts">
	import { enhance } from '$app/forms';
	import { sealing } from '#lib/crypto/seal-form.ts';
	// Choose which insights the group shows (#174): every section, the type's suggestions marked.
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import { sectionHints, sectionTitles } from '#lib/components/insights/section-texts.ts';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { LAYOUTS, SECTIONS, sectionsFor } from '#lib/insights/sections.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const suggested = $derived(LAYOUTS[data.group.kind].sections);
	const shown = $derived(sectionsFor(data.group.kind, data.group.insightSections));
</script>

<svelte:head>
	<title>{m.insights_customize()} – {data.group.name}</title>
</svelte:head>

<AppPage
	title={m.insights_customize()}
	back={{
		href: groupTabUrl(resolve('/g/[token]', { token: data.group.shareToken }), 'insights'),
		label: data.group.name
	}}
>
	<GroupForm sealed={['sections']} submitLabel={m.save()}>
		<div class="page-sections">
			<fieldset class="page-section">
				<legend class="pb-4 text-sm text-muted">{m.insights_customize_hint()}</legend>
				{#each SECTIONS as section (section)}
					<label class="flex cursor-pointer items-start gap-3 has-focus-visible:ring-2">
						<input
							type="checkbox"
							name="section"
							value={section}
							checked={shown.includes(section)}
							class="mt-0.5 size-[18px] shrink-0 accent-accent dark:accent-accent-night"
						/>
						<span class="min-w-0">
							<span class="block text-sm font-medium">
								{sectionTitles[section]()}
								{#if suggested.includes(section)}
									<span
										class="ms-1 rounded-full bg-surface-muted px-2 py-0.5 text-xs font-normal text-muted dark:bg-surface-muted-night"
										>{m.insights_suggested()}</span
									>
								{/if}
							</span>
							<span class="block text-sm text-muted">{sectionHints[section]()}</span>
						</span>
					</label>
				{/each}
			</fieldset>
		</div>
	</GroupForm>
	<!-- Forgets the choice (red, like every reset) -->
	<form
		method="POST"
		action="?/reset"
		class="px-4"
		use:enhance={(input) => {
			input.formData.set('reset', 'on');
			return sealing(['sections'])(input);
		}}
	>
		<button type="submit" class="min-h-11 text-sm font-medium tone-destructive"
			>{m.insights_back_to_suggested()}</button
		>
	</form>
</AppPage>
