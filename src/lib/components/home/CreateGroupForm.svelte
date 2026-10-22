<script lang="ts">
	import { enhance } from '$app/forms';
	import { Block, BlockTitle, List } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';
	import MemberChips from './MemberChips.svelte';

	type Values = {
		name: string;
		description: string;
		currency: string;
		you: string;
		members: string[];
	};

	type Props = {
		currencies: { code: string; label: string }[];
		defaultCurrency: string;
		values?: Values;
		error?: ErrorCode;
		/** Pre-fills "Your name" (A-13) */
		profileName: string;
	};

	let { currencies, defaultCurrency, values, error, profileName }: Props = $props();

	const submission = new Submission();
	const currency = $derived(values?.currency || defaultCurrency);
</script>

<section>
	<form method="POST" use:enhance={submission.enhance}>
		<List strong inset>
			<Field
				label={m.field_group_name()}
				name="name"
				required
				maxlength={LIMITS.groupName}
				value={values?.name ?? ''}
			/>
			<Field
				label={m.field_description()}
				name="description"
				type="textarea"
				maxlength={LIMITS.description}
				value={values?.description ?? ''}
			/>
			<Field label={m.field_currency()} name="currency" type="select" dropdown value={currency}>
				{#each currencies as option (option.code)}
					<option value={option.code} selected={option.code === currency}>{option.label}</option>
				{/each}
			</Field>
			<Field
				label={m.field_your_name()}
				name="you"
				required
				maxlength={LIMITS.memberName}
				autocomplete="given-name"
				value={values?.you ?? profileName}
			/>
		</List>

		<BlockTitle>{m.field_other_members()}</BlockTitle>
		<List strong inset>
			<MemberChips names={values?.members} />
		</List>

		<FormError {error} />

		<Block>
			<SubmitButton pending={submission.pending}>{m.create_submit()}</SubmitButton>
		</Block>
	</form>
</section>
