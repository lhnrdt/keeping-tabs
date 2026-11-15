<script lang="ts">
	import CopyButton from '#lib/components/CopyButton.svelte';
	import AmountField from '#lib/components/fields/AmountField.svelte';
	import DateField from '#lib/components/fields/DateField.svelte';
	import MemberSelect from '#lib/components/fields/MemberSelect.svelte';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { Member } from '#lib/group/members.ts';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import { calmSlide } from '#lib/motion/calm.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { paymentValues } from '#lib/expense/form-values.ts';
	import { previewPayment } from '#lib/offline/preview.ts';
	import { parsePayment } from '#lib/validation.ts';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { resolve } from '$app/paths';

	type Props = {
		members: Member[];
		currency: string;
		values: { from: string; to: string; amount: string; date: string };
		error?: ErrorCode;
		submitLabel: string;
		paymentId?: string;
		/** The group's link token: without a connection, it waits on the device (#347) */
		token?: string;
	};

	let { members, currency, values, error, submitLabel, paymentId, token }: Props = $props();
	// Sealed for this row (#110): an edited one's, or a new one's, whose id is made here
	const clientId = crypto.randomUUID();

	// Follows the chosen recipient, to show how to pay them (#47)
	// Nothing suggested: from you, to the first of the others, as the usual case
	const identity = useIdentity();
	const from = $derived(values.from || identity.memberId || members[0]?.id);
	let to = $derived(values.to || members.find((member) => member.id !== from)?.id);
	const details = $derived(
		(members as (Member & { paymentDetails?: string | null })[]).find((member) => member.id === to)
			?.paymentDetails
	);
	const toName = $derived(members.find((member) => member.id === to)?.name ?? '');

	// Its row in the list while it goes out (#347): saved on the device at once, when it's valid
	function previewOf(typed: FormData, id: string) {
		const parsed = parsePayment(paymentValues(typed), {
			memberIds: members.map((member) => member.id),
			currency
		});
		return parsed.ok ? previewPayment(id, parsed.value) : undefined;
	}
</script>

<GroupForm
	{error}
	{submitLabel}
	sealed={['payment']}
	sealRow={paymentId ?? clientId}
	announce={paymentId ? undefined : 'payment'}
	moment={paymentId ? undefined : { kind: 'paid', id: clientId }}
	offlineToken={token}
	pendingAs={paymentId ? { kind: 'edit', target: paymentId } : { kind: 'pay' }}
	landing={token ? groupTabUrl(resolve('/g/[token]', { token }), 'balances') : undefined}
	preview={previewOf}
	instantly={(typed) => previewOf(typed, clientId) !== undefined}
>
	<input type="hidden" name="clientId" value={paymentId ? '' : clientId} />
	<div class="page-sections">
		<div
			class="page-section"
			onchange={(event) => {
				const field = event.target as HTMLSelectElement;
				if (field.name === 'to') to = field.value;
			}}
		>
			<div class="grid grid-cols-2 gap-2.5">
				<MemberSelect label={m.field_payment_from()} name="from" {members} value={from} />
				<MemberSelect label={m.field_payment_to()} name="to" {members} value={to} />
			</div>
			<AmountField value={values.amount} {currency} />
			<DateField value={values.date} />
		</div>
		{#if details}
			<div class="flex flex-col gap-2 rounded-xl bg-current/[0.07] p-3.5" transition:calmSlide>
				<p class="text-sm text-muted">{m.payment_details_of({ name: toName })}</p>
				<p class="selectable font-medium break-words select-all" data-testid="payment-details">
					{details}
				</p>
				<CopyButton text={details} label={m.copy()} />
			</div>
		{/if}
	</div>
</GroupForm>
