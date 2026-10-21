<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { getMe } from '#lib/device.ts';
	import { errorMessage, type ErrorCode } from '#lib/errors.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';

	type Props = {
		groupId: string;
		members: { id: string; name: string }[];
		currency: string;
		/** Raw form values; empty strings for a new expense */
		values: { title: string; amount: string; date: string; paidBy: string; participants: string[] };
		error?: ErrorCode;
		submitLabel: string;
	};

	let { groupId, members, currency, values, error, submitLabel }: Props = $props();

	let meId = $state<string | null>(null);
	let dateInput = $state<HTMLInputElement>();
	const paidBy = $derived(values.paidBy || meId || members[0]?.id);

	onMount(() => {
		meId = getMe(groupId);
		// A new expense defaults to today in the visitor's time zone, not the server's
		if (dateInput && !values.date) {
			const now = new Date();
			dateInput.value = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
				.toISOString()
				.slice(0, 10);
		}
	});
</script>

<form method="POST" action="?/save" use:enhance class="space-y-4">
	<input type="hidden" name="actor" value={meId ?? ''} />
	<label class="block">
		<span class="text-sm font-medium">{m.field_expense_title()}</span>
		<input
			class="mt-1 block w-full rounded-md"
			name="title"
			required
			maxlength={LIMITS.expenseTitle}
			value={values.title}
		/>
	</label>
	<div class="flex gap-3">
		<label class="block flex-1">
			<span class="text-sm font-medium">{m.field_amount()} ({currency})</span>
			<input
				class="mt-1 block w-full rounded-md"
				name="amount"
				inputmode="decimal"
				autocomplete="off"
				required
				value={values.amount}
			/>
		</label>
		<label class="block flex-1">
			<span class="text-sm font-medium">{m.field_date()}</span>
			<input
				class="mt-1 block w-full rounded-md"
				type="date"
				name="date"
				required
				value={values.date}
				bind:this={dateInput}
			/>
		</label>
	</div>
	<label class="block">
		<span class="text-sm font-medium">{m.field_paid_by()}</span>
		<select class="mt-1 block w-full rounded-md" name="paidBy">
			{#each members as member (member.id)}
				<option value={member.id} selected={member.id === paidBy}>{member.name}</option>
			{/each}
		</select>
	</label>
	<fieldset class="space-y-1">
		<legend class="text-sm font-medium">{m.field_split_between()}</legend>
		{#each members as member (member.id)}
			<label class="flex items-center gap-2">
				<input
					type="checkbox"
					class="rounded"
					name="participants"
					value={member.id}
					checked={values.participants.includes(member.id)}
				/>
				{member.name}
			</label>
		{/each}
	</fieldset>

	{#if error}
		<p class="text-red-700" role="alert">{errorMessage(error)}</p>
	{/if}

	<button class="w-full rounded-md bg-blue-700 px-4 py-2 font-semibold text-white">
		{submitLabel}
	</button>
</form>
