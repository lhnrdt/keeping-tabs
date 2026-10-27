<script lang="ts">
	import { Block, BlockTitle, List } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import AmountField from '#lib/components/fields/AmountField.svelte';
	import DateField from '#lib/components/fields/DateField.svelte';
	import MemberSelect from '#lib/components/fields/MemberSelect.svelte';
	import CategoryPicker from '#lib/components/pickers/CategoryPicker.svelte';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { ExpenseCategory } from '#lib/expense/categories.ts';
	import { learnCategories } from '#lib/expense/learned.ts';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import type { Member } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';
	import { isSplitMode, type SplitMode } from '#lib/split/modes.ts';
	import ParticipantChecklist from './ParticipantChecklist.svelte';
	import SplitInputs from './SplitInputs.svelte';
	import SplitModePicker from './SplitModePicker.svelte';
	import TwoPersonPresets from './TwoPersonPresets.svelte';
	import PayerAmounts from './PayerAmounts.svelte';
	import { SEVERAL_PAYERS } from '#lib/validation.ts';
	import { presetOf } from '#lib/split/presets.ts';
	import { canBeDefault } from '#lib/split/default-split.ts';

	type Props = {
		members: Member[];
		currency: string;
		/** Raw form values; empty strings for a new expense */
		values: {
			title: string;
			/** A note on it (#123) */
			notes: string;
			/** With paidBy "several" (#39): what each paid as typed, by member id */
			payers?: Record<string, string>;
			amount: string;
			date: string;
			paidBy: string;
			participants: string[];
			category: string;
			splitMode: string;
			/** Split inputs by member id, for the unequal modes */
			inputs: Record<string, string>;
		};
		/** The group's hand-chosen categories, newest first */
		chosen: { title: string; category: ExpenseCategory | null }[];
		error?: ErrorCode;
		submitLabel: string;
		/** A new expense can repeat (#45) */
		canRepeat?: boolean;
	};

	let {
		members,
		currency,
		values,
		chosen,
		error,
		submitLabel,
		canRepeat = false
	}: Props = $props();

	const identity = useIdentity();
	// Follows the typed title, so the automatic category can show its guess
	let title = $derived(values.title);
	// Follows the typed amount, so the split shows each share live
	let amount = $derived(values.amount);
	let mode = $derived<SplitMode>(isSplitMode(values.splitMode) ? values.splitMode : 'equal');
	const paidBy = $derived(values.paidBy || identity.memberId || members[0]?.id);
	// Follows the payer choice: several people show what each paid (#39)
	let payer = $derived(paidBy);
	// Two people: quick choices instead of the payer and split (#40), unless more is wanted
	const pair = $derived.by(() => {
		const me = identity.memberId;
		const other = members.find((member) => member.id !== me);
		return members.length === 2 && me && other ? { me, other } : null;
	});
	let preset = $derived(pair ? presetOf(values, { me: pair.me, other: pair.other.id }) : null);
	let more = $state(false);
	const quick = $derived(pair !== null && preset !== null && !more);
	// Folded away until wanted, so the form stays short (#123)
	let noting = $derived(values.notes !== '');
</script>

<GroupForm {error} {submitLabel}>
	<!-- Listens around the list, so the list keeps only list items -->
	<div
		class="contents"
		onchange={(event) => {
			const field = event.target as HTMLSelectElement;
			if (field.name === 'paidBy') payer = field.value;
		}}
	>
		<List strong inset>
			<Field
				label={m.field_expense_title()}
				name="title"
				required
				maxlength={LIMITS.expenseTitle}
				bind:value={title}
			/>
			<AmountField bind:value={amount} {currency} />
			<DateField value={values.date} />
			{#if canRepeat}
				<Field label={m.field_repeats()} name="repeats" type="select" dropdown value="">
					<option value="">{m.repeats_never()}</option>
					<option value="weekly">{m.repeats_weekly()}</option>
					<option value="monthly">{m.repeats_monthly()}</option>
					<option value="yearly">{m.repeats_yearly()}</option>
				</Field>
			{/if}
			{#if !quick}
				<MemberSelect
					label={m.field_paid_by()}
					name="paidBy"
					{members}
					value={paidBy}
					extra={{ value: SEVERAL_PAYERS, label: m.payers_several() }}
				/>
			{/if}
			{#if noting}
				<Field
					label={m.field_note()}
					name="notes"
					type="textarea"
					inputClass="!h-24 resize-none"
					maxlength={LIMITS.expenseNote}
					value={values.notes}
				/>
			{/if}
		</List>
	</div>
	{#if !quick && payer === SEVERAL_PAYERS}
		<PayerAmounts {members} {currency} {amount} initial={values.payers ?? {}} />
	{/if}
	{#if !noting}
		<Block class="!-mt-4 !mb-2">
			<button
				type="button"
				class="text-sm font-medium text-accent dark:text-accent-night"
				onclick={() => (noting = true)}
			>
				{m.add_note()}
			</button>
		</Block>
	{/if}

	<BlockTitle>{m.field_split()}</BlockTitle>
	{#if quick && pair && preset}
		<TwoPersonPresets me={pair.me} other={pair.other} bind:preset onMore={() => (more = true)} />
	{:else}
		<SplitModePicker bind:mode />
		{#if mode === 'equal'}
			<ParticipantChecklist {members} selected={values.participants} />
		{:else}
			<SplitInputs
				{mode}
				{members}
				{currency}
				{amount}
				initial={{
					mode: isSplitMode(values.splitMode) ? values.splitMode : 'equal',
					inputs: values.inputs
				}}
			/>
			{#if canBeDefault(mode)}
				<!-- Remember this split for the group's new expenses (#41) -->
				<Block class="!-mt-2 !mb-4">
					<label class="flex cursor-pointer items-center gap-3 text-sm">
						<input
							type="checkbox"
							name="makeDefault"
							class="h-5 w-5 shrink-0 accent-accent dark:accent-accent-night"
						/>
						{m.default_split_remember()}
					</label>
				</Block>
			{/if}
		{/if}
	{/if}

	<!-- A card, not a List: pickers are fieldsets, not list items (#79) -->
	<Block strong inset class="!px-0 !py-3">
		<CategoryPicker value={values.category} {title} learned={learnCategories(chosen)} />
	</Block>
</GroupForm>
