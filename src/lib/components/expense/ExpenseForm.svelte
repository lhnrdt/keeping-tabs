<script lang="ts">
	import { BlockTitle, List } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import AmountField from '#lib/components/fields/AmountField.svelte';
	import DateField from '#lib/components/fields/DateField.svelte';
	import MemberSelect from '#lib/components/fields/MemberSelect.svelte';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import type { Member } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';
	import ParticipantChecklist from './ParticipantChecklist.svelte';

	type Props = {
		members: Member[];
		currency: string;
		/** Raw form values; empty strings for a new expense */
		values: { title: string; amount: string; date: string; paidBy: string; participants: string[] };
		error?: ErrorCode;
		submitLabel: string;
	};

	let { members, currency, values, error, submitLabel }: Props = $props();

	const identity = useIdentity();
	const paidBy = $derived(values.paidBy || identity.memberId || members[0]?.id);
</script>

<GroupForm {error} {submitLabel}>
	<List strong inset>
		<Field
			label={m.field_expense_title()}
			name="title"
			required
			maxlength={LIMITS.expenseTitle}
			value={values.title}
		/>
		<AmountField value={values.amount} {currency} />
		<DateField value={values.date} />
		<MemberSelect label={m.field_paid_by()} name="paidBy" {members} value={paidBy} />
	</List>

	<BlockTitle>{m.field_split_between()}</BlockTitle>
	<ParticipantChecklist {members} selected={values.participants} />
</GroupForm>
