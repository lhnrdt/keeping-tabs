<script lang="ts">
	import { enhance } from '$app/forms';
	import { Block, BlockTitle, List } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import KindPicker from '#lib/components/pickers/KindPicker.svelte';
	import TintPicker from '#lib/components/pickers/TintPicker.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { DEFAULT_GROUP_KIND } from '#lib/group/kinds.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';
	import MemberChips from './MemberChips.svelte';

	type Values = {
		name: string;
		description: string;
		currency: string;
		kind: string;
		tint: string;
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
				placeholder={m.placeholder_group_name()}
				name="name"
				required
				maxlength={LIMITS.groupName}
				value={values?.name ?? ''}
			/>
			<Field
				label={m.field_description()}
				placeholder={m.placeholder_description()}
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
				placeholder={m.placeholder_name()}
				name="you"
				required
				maxlength={LIMITS.memberName}
				autocomplete="given-name"
				value={values?.you ?? profileName}
			/>
		</List>

		<!-- A card, not a List: pickers are fieldsets, not list items (#79) -->
		<Block strong inset class="!px-0 !py-3">
			<KindPicker value={values?.kind ?? DEFAULT_GROUP_KIND} />
			<TintPicker value={values?.tint ?? ''} />
		</Block>

		<BlockTitle>{m.field_other_members()}</BlockTitle>
		<MemberChips names={values?.members} />

		<FormError {error} />

		<Block>
			<SubmitButton pending={submission.pending}>{m.create_submit()}</SubmitButton>
		</Block>
	</form>
</section>
