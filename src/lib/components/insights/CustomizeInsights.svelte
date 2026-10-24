<script lang="ts">
	// Choose which insights the group shows (#174): every section, the type's suggestions
	// marked; saved for the whole group. "Back to suggested" forgets the choice.
	import { Block, Button } from 'konsta/svelte';
	import FormDialog from '#lib/components/group/FormDialog.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LAYOUTS, SECTIONS, type Section } from '#lib/insights/sections.ts';

	let { kind, shown }: { kind: GroupKind; shown: readonly Section[] } = $props();

	let editing = $state(false);
	const suggested = $derived(LAYOUTS[kind].sections);

	const names: Record<Section, () => string> = {
		budget: m.insights_budget,
		highlights: m.insights_highlights,
		overTime: m.insights_over_time,
		categories: m.insights_by_category,
		kinds: m.insights_kinds,
		fixedCosts: m.insights_fixed,
		biggest: m.insights_biggest,
		whoPays: m.insights_who_pays,
		howOften: m.insights_how_often,
		myPosition: m.insights_position,
		settling: m.insights_settling
	};
	const descriptions: Record<Section, () => string> = {
		budget: m.section_budget_hint,
		highlights: m.section_highlights_hint,
		overTime: m.section_over_time_hint,
		categories: m.section_categories_hint,
		kinds: m.section_kinds_hint,
		fixedCosts: m.section_fixed_hint,
		biggest: m.section_biggest_hint,
		whoPays: m.section_who_pays_hint,
		howOften: m.section_how_often_hint,
		myPosition: m.section_position_hint,
		settling: m.section_settling_hint
	};
</script>

<Block class="!mt-6">
	<Button large rounded tonal type="button" class="gap-2" onclick={() => (editing = true)}>
		<Icon name="edit" size={20} />
		{m.insights_customize()}
	</Button>
</Block>

<FormDialog
	opened={editing}
	title={m.insights_customize()}
	action={tabAction('insightSections', 'insights')}
	submitLabel={m.save()}
	onClose={() => (editing = false)}
>
	<fieldset>
		<legend class="mb-2 text-sm text-muted">{m.insights_customize_hint()}</legend>
		<ul class="space-y-1">
			{#each SECTIONS as section (section)}
				<li>
					<label
						class="flex cursor-pointer items-start gap-3 rounded-xl px-1 py-2 has-focus-visible:ring-2"
					>
						<input
							type="checkbox"
							name="section"
							value={section}
							checked={shown.includes(section)}
							class="mt-1 h-5 w-5 shrink-0 accent-accent dark:accent-accent-night"
						/>
						<span class="min-w-0">
							<span class="block text-sm font-medium">
								{names[section]()}
								{#if suggested.includes(section)}
									<span
										class="ms-1 rounded-full bg-surface-muted px-2 py-0.5 text-xs font-normal text-muted dark:bg-surface-muted-night"
										>{m.insights_suggested()}</span
									>
								{/if}
							</span>
							<span class="block text-xs text-muted">{descriptions[section]()}</span>
						</span>
					</label>
				</li>
			{/each}
		</ul>
	</fieldset>
	<!-- Forgets the choice: the group type's suggestions again (red, like every reset) -->
	<button
		type="submit"
		formaction={`${tabAction('insightSections', 'insights')}&reset`}
		formnovalidate
		class="mt-3 text-sm font-medium tone-destructive"
	>
		{m.insights_back_to_suggested()}
	</button>
</FormDialog>
