<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import SplitInputs from '#lib/components/expense/SplitInputs.svelte';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { defaultFormValues, DEFAULT_MODES, type DefaultMode } from '#lib/split/default-split.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	/** Percentages need an amount to add up to; any will do, as none is shown */
	const ANY_AMOUNT = '100';

	const modeLabels: Record<'equal' | DefaultMode, () => string> = {
		equal: m.split_equal,
		percent: m.split_percent,
		shares: m.split_shares
	};

	// What was refused, else what's set now
	const initial = (): { splitMode: string; inputs: Record<string, string> } => {
		if (form?.values) {
			return { splitMode: String(form.values.splitMode ?? 'equal'), inputs: form.values.inputs };
		}
		const split = data.group.defaultSplit;
		const memberIds = data.members.map((member) => member.id);
		return split
			? defaultFormValues(split, memberIds, data.group.currency)
			: { splitMode: 'equal', inputs: {} };
	};
	let mode = $state(initial().splitMode);
</script>

<svelte:head>
	<title>{m.field_default_split()} – {data.group.name}</title>
</svelte:head>

<AppPage
	title={m.field_default_split()}
	back={{
		href: groupTabUrl(resolve('/g/[token]', { token: data.group.shareToken }), 'group'),
		label: data.group.name
	}}
>
	<GroupForm error={form?.error} submitLabel={m.save()} sealed={['defaultSplit']}>
		<div class="page-sections">
			<div class="page-section">
				<p class="text-sm text-muted">{m.default_split_hint()}</p>
				<PlainField label={m.field_split()} arrow>
					{#snippet children(id)}
						<select {id} name="splitMode" bind:value={mode}>
							{#each ['equal', ...DEFAULT_MODES] as const as option (option)}
								<option value={option}>{modeLabels[option]()}</option>
							{/each}
						</select>
					{/snippet}
				</PlainField>
				{#if mode === 'percent' || mode === 'shares'}
					<SplitInputs
						{mode}
						members={data.members}
						currency={data.group.currency}
						amount={ANY_AMOUNT}
						amounts={false}
						initial={{ mode: initial().splitMode as DefaultMode, inputs: initial().inputs }}
					/>
				{/if}
			</div>
		</div>
	</GroupForm>
</AppPage>
