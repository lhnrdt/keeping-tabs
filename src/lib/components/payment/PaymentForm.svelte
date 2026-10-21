<script lang="ts">
	import { List } from 'konsta/svelte';
	import AmountField from '#lib/components/fields/AmountField.svelte';
	import DateField from '#lib/components/fields/DateField.svelte';
	import MemberSelect from '#lib/components/fields/MemberSelect.svelte';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { Member } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		members: Member[];
		currency: string;
		values: { from: string; to: string; amount: string; date: string };
		error?: ErrorCode;
		submitLabel: string;
	};

	let { members, currency, values, error, submitLabel }: Props = $props();
</script>

<GroupForm {error} {submitLabel}>
	<List strong inset>
		<MemberSelect label={m.field_payment_from()} name="from" {members} value={values.from} />
		<MemberSelect label={m.field_payment_to()} name="to" {members} value={values.to} />
		<AmountField value={values.amount} {currency} />
		<DateField value={values.date} />
	</List>
</GroupForm>
