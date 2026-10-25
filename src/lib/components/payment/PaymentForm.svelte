<script lang="ts">
	import { Block, List } from 'konsta/svelte';
	import CopyButton from '#lib/components/CopyButton.svelte';
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

	// Follows the chosen recipient, to show how to pay them (#47)
	let to = $derived(values.to);
	const details = $derived(
		(members as (Member & { paymentDetails?: string | null })[]).find((member) => member.id === to)
			?.paymentDetails
	);
	const toName = $derived(members.find((member) => member.id === to)?.name ?? '');
</script>

<GroupForm {error} {submitLabel}>
	<!-- Listens around the list, so the list keeps only list items -->
	<div
		class="contents"
		onchange={(event) => {
			const field = event.target as HTMLSelectElement;
			if (field.name === 'to') to = field.value;
		}}
	>
		<List strong inset>
			<MemberSelect label={m.field_payment_from()} name="from" {members} value={values.from} />
			<MemberSelect label={m.field_payment_to()} name="to" {members} value={values.to} />
			<AmountField value={values.amount} {currency} />
			<DateField value={values.date} />
		</List>
	</div>
	{#if details}
		<Block strong inset class="!my-2">
			<p class="text-sm text-muted">{m.payment_details_of({ name: toName })}</p>
			<p class="mt-1 font-medium break-words select-all" data-testid="payment-details">{details}</p>
			<div class="mt-3"><CopyButton text={details} label={m.copy()} /></div>
		</Block>
	{/if}
</GroupForm>
