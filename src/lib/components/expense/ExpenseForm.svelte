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

	type Props = {
		members: Member[];
		currency: string;
		/** Raw form values; empty strings for a new expense */
		values: {
			title: string;
			/** A note on it (#123) */
			notes: string;
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
	};

	let { members, currency, values, chosen, error, submitLabel }: Props = $props();

	const identity = useIdentity();
	// Follows the typed title, so the automatic category can show its guess
	let title = $derived(values.title);
	// Follows the typed amount, so the split shows each share live
	let amount = $derived(values.amount);
	let mode = $derived<SplitMode>(isSplitMode(values.splitMode) ? values.splitMode : 'equal');
	const paidBy = $derived(values.paidBy || identity.memberId || members[0]?.id);
	// Folded away until wanted, so the form stays short (#123)
	let noting = $derived(values.notes !== '');
</script>

<GroupForm {error} {submitLabel}>
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
		<MemberSelect label={m.field_paid_by()} name="paidBy" {members} value={paidBy} />
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
	{/if}

	<!-- A card, not a List: pickers are fieldsets, not list items (#79) -->
	<Block strong inset class="!px-0 !py-3">
		<CategoryPicker value={values.category} {title} learned={learnCategories(chosen)} />
	</Block>
</GroupForm>
