<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import Field from '#lib/components/Field.svelte';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import { isEntryCurrency, RATE_CURRENCIES } from '#lib/expense/exchange.ts';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import SimplifyDebtsField from '#lib/components/group/SimplifyDebtsField.svelte';
	import KindPicker from '#lib/components/pickers/KindPicker.svelte';
	import TintPicker from '#lib/components/pickers/TintPicker.svelte';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.edit_group()} – {data.group.name}</title>
</svelte:head>

<AppPage
	title={m.edit_group()}
	back={{
		href: groupTabUrl(resolve('/g/[token]', { token: data.group.shareToken }), 'group'),
		label: data.group.name
	}}
>
	<GroupForm
		error={form?.error}
		submitLabel={m.save()}
		sealed={['name', 'description', 'groupForm']}
	>
		<div class="page-sections">
			<div class="page-section">
				<Field
					label={m.field_group_name()}
					placeholder={m.placeholder_group_name()}
					name="name"
					required
					maxlength={LIMITS.groupName}
					value={data.group.name}
				/>
				<Field
					label={m.field_description()}
					placeholder={m.placeholder_description()}
					name="description"
					type="textarea"
					maxlength={LIMITS.description}
					value={data.group.description ?? ''}
				/>
				<SimplifyDebtsField checked={data.group.simplifyDebts} />
			</div>
			<div class="-mx-4">
				<KindPicker value={data.group.kind} />
				<TintPicker value={data.group.tint ?? ''} />
			</div>
			{#if isEntryCurrency(data.group.currency)}
				<div class="page-section">
					<PlainField label={m.field_entry_currency()} arrow>
						{#snippet children(id)}
							<select {id} name="entryCurrency" value={data.group.entryCurrency ?? ''}>
								<option value="">{m.entry_currency_group({ currency: data.group.currency })}</option
								>
								{#each RATE_CURRENCIES.filter((code) => code !== data.group.currency) as code (code)}
									<option value={code}>{code}</option>
								{/each}
							</select>
						{/snippet}
					</PlainField>
				</div>
			{/if}
		</div>
	</GroupForm>
</AppPage>
