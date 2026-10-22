<script lang="ts">
	import { BlockTitle, List } from 'konsta/svelte';
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
	</List>

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

	<List strong inset class="py-3">
		<CategoryPicker value={values.category} {title} learned={learnCategories(chosen)} />
	</List>
</GroupForm>
