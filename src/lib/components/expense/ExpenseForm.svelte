<script lang="ts">
	import { enhance } from '$app/forms';
	import { Block, BlockTitle, List } from 'konsta/svelte';
	import { onMount } from 'svelte';
	import Field from '#lib/components/Field.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import ActorInput from '#lib/components/group/ActorInput.svelte';
	import { todayInputValue } from '#lib/dates.ts';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
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
	const submission = new Submission();
	const paidBy = $derived(values.paidBy || identity.memberId || members[0]?.id);
	// A new expense defaults to today in the visitor's time zone, not the server's
	let today = $state('');
	onMount(() => (today = todayInputValue()));
</script>

<form method="POST" action="?/save" use:enhance={submission.enhance}>
	<ActorInput />
	<List strong inset>
		<Field
			label={m.field_expense_title()}
			name="title"
			required
			maxlength={LIMITS.expenseTitle}
			value={values.title}
		/>
		<Field
			label={`${m.field_amount()} (${currency})`}
			name="amount"
			inputmode="decimal"
			autocomplete="off"
			required
			value={values.amount}
		/>
		<Field label={m.field_date()} name="date" type="date" required value={values.date || today} />
		<Field label={m.field_paid_by()} name="paidBy" type="select" dropdown value={paidBy}>
			{#each members as member (member.id)}
				<option value={member.id} selected={member.id === paidBy}>{member.name}</option>
			{/each}
		</Field>
	</List>

	<BlockTitle>{m.field_split_between()}</BlockTitle>
	<ParticipantChecklist {members} selected={values.participants} />

	<FormError {error} />

	<Block>
		<SubmitButton pending={submission.pending}>{submitLabel}</SubmitButton>
	</Block>
</form>
