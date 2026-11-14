<script lang="ts">
	import { cueMoment } from '#lib/motion/moments.ts';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { rememberKey } from '#lib/crypto/keyring.ts';
	import { openDeep } from '#lib/crypto/open-data.ts';
	import { newKey, sealText, textContext } from '#lib/crypto/seal.ts';
	import { SEALED_GROUP_COLUMNS } from '#lib/expense/sealed-details.ts';
	import { sealFields } from '#lib/crypto/seal-form.ts';
	import { syncKeys } from '#lib/crypto/vault.ts';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import StickySubmit from '#lib/components/StickySubmit.svelte';
	import KindPicker from '#lib/components/pickers/KindPicker.svelte';
	import TintPicker from '#lib/components/pickers/TintPicker.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { DEFAULT_GROUP_KIND } from '#lib/group/kinds.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS, normalizeText } from '#lib/validation.ts';
	import EncryptedNote from '#lib/components/EncryptedNote.svelte';
	import MemberChips from './MemberChips.svelte';

	const SEALED_FIELDS = ['name', 'description', 'you', 'member'];

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

	/** An encrypted group (#110): a new key, which stays here, and everything typed sealed with it */
	const create: SubmitFunction = async (input) => {
		const form = input.formData;
		let settings: Record<string, string> = {};
		if (form.get('plain') !== 'on') {
			// The server can't compare sealed names
			const names = [form.get('you'), ...form.getAll('member')].map((name) =>
				normalizeText(String(name ?? '')).toLocaleLowerCase()
			);
			if (new Set(names).size < names.length) {
				input.cancel();
				const refusal = {
					type: 'failure',
					status: 400,
					data: {
						error: 'member_name_taken',
						values: {
							...Object.fromEntries(form.entries()),
							members: form.getAll('member').map(String)
						}
					}
				};
				await applyAction(refusal as unknown as Parameters<typeof applyAction>[0]);
				return;
			}
			const key = newKey();
			const keyId = await rememberKey(key);
			// Its settings too; the plain fields only hold the defaults then
			settings = {
				currency: String(form.get('currency') ?? ''),
				kind: String(form.get('kind') ?? ''),
				tint: String(form.get('tint') ?? '')
			};
			const details = {
				...SEALED_GROUP_COLUMNS,
				currency: settings.currency,
				kind: settings.kind,
				tint: settings.tint || null
			};
			form.set('details', await sealText(key, JSON.stringify(details), textContext('details')));
			form.set('currency', SEALED_GROUP_COLUMNS.currency);
			form.set('kind', SEALED_GROUP_COLUMNS.kind);
			form.set('tint', '');
			await sealFields(form, key, SEALED_FIELDS);
			form.set('keyId', keyId);
		}
		const after = submission.enhance(input) as Exclude<
			ReturnType<SubmitFunction>,
			Promise<unknown>
		>;
		return async (options) => {
			if (options.result.type === 'failure') {
				const data = await openDeep(options.result.data);
				if (data?.values) data.values = { ...(data.values as object), ...settings };
				options.result.data = data;
			}
			await after?.(options);
			if (options.result.type === 'redirect') {
				// The new group's scene greets it (#291)
				cueMoment({ kind: 'created' });
				void syncKeys().catch(() => {});
			}
		};
	};
	const currency = $derived(values?.currency || defaultCurrency);
</script>

<section>
	<form method="POST" use:enhance={create}>
		<div class="page-sections">
			<div class="page-section">
				<PlainField label={m.field_group_name()}>
					{#snippet children(id)}
						<input
							{id}
							name="name"
							required
							maxlength={LIMITS.groupName}
							placeholder={m.placeholder_group_name()}
							value={values?.name ?? ''}
						/>
					{/snippet}
				</PlainField>
				<PlainField label={m.field_description()}>
					{#snippet children(id)}
						<textarea
							{id}
							name="description"
							rows="2"
							maxlength={LIMITS.description}
							placeholder={m.placeholder_description()}
							value={values?.description ?? ''}></textarea>
					{/snippet}
				</PlainField>
				<PlainField label={m.field_currency()} arrow>
					{#snippet children(id)}
						<select {id} name="currency" value={currency}>
							{#each currencies as option (option.code)}
								<option value={option.code} selected={option.code === currency}
									>{option.label}</option
								>
							{/each}
						</select>
					{/snippet}
				</PlainField>
				<PlainField label={m.field_your_name()}>
					{#snippet children(id)}
						<input
							{id}
							name="you"
							required
							maxlength={LIMITS.memberName}
							autocomplete="given-name"
							placeholder={m.placeholder_name()}
							value={values?.you ?? profileName}
						/>
					{/snippet}
				</PlainField>
			</div>
			<div class="-mx-4">
				<KindPicker value={values?.kind ?? DEFAULT_GROUP_KIND} />
				<TintPicker value={values?.tint ?? ''} />
			</div>
			<section class="-mx-4 flex flex-col gap-2">
				<h2 class="section-label mx-4">{m.field_other_members()}</h2>
				<MemberChips names={values?.members} />
			</section>
			<EncryptedNote />
			<FormError {error} />
		</div>
		<StickySubmit>
			<SubmitButton pending={submission.pending}>{m.create_submit()}</SubmitButton>
		</StickySubmit>
	</form>
</section>
