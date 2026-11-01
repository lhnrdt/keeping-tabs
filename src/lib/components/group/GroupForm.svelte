<script lang="ts">
	// Shell for a full-screen group form: error and pending submit button. A form that can
	// wait for the connection (#55) is kept on the device when sending fails for lack of one,
	// and the group shows it until it's through.
	import { enhance, type SubmitFunction } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import FormError from '#lib/components/FormError.svelte';
	import StickySubmit from '#lib/components/StickySubmit.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { sealing } from '#lib/crypto/seal-form.ts';
	import { keep } from '#lib/offline/outbox.ts';

	type Props = {
		error?: ErrorCode;
		submitLabel: string;
		/** The group's token, when this form can wait for the connection */
		offlineToken?: string;
		/** Fields holding text, sealed in an encrypted group (#110) */
		sealed?: readonly string[];
		/** The row they're for, when it's known */
		sealRow?: string;
		/** Runs once it's saved, before moving on; can name a different page to go to */
		onSaved?: () => Promise<string | void>;
		children: Snippet;
	};

	let {
		error,
		submitLabel,
		offlineToken,
		sealed = [],
		sealRow,
		onSaved,
		children
	}: Props = $props();

	const submission = new Submission();
	let typed = new FormData();

	/** The request never reached the server (no connection), as opposed to it saying no */
	const unreachable = (failure: unknown) => failure instanceof TypeError || !navigator.onLine;

	const submit: SubmitFunction = (input) => {
		const after = submission.enhance(input) as Exclude<
			ReturnType<SubmitFunction>,
			Promise<unknown>
		>;
		return async (options) => {
			const { result } = options;
			if (offlineToken && result.type === 'error' && unreachable(result.error)) {
				const fields = [...input.formData].map(([key, value]) => [key, String(value)]) as [
					string,
					string
				][];
				const field = (name: string) => String(typed.get(name) ?? '');
				const kept = keep({
					id: field('clientId') || crypto.randomUUID(),
					token: offlineToken,
					action: input.action.href,
					fields,
					title: field('title'),
					amount: field('amount'),
					date: field('date'),
					addedAt: Date.now()
				});
				if (kept) {
					submission.pending = false;
					await goto(resolve('/g/[token]', { token: offlineToken }));
					return;
				}
			}
			if (result.type === 'redirect' && onSaved) {
				const elsewhere = await onSaved();
				if (elsewhere) {
					submission.pending = false;
					// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved by the caller
					await goto(elsewhere);
					return;
				}
			}
			await after?.(options);
		};
	};
</script>

<form
	method="POST"
	action="?/save"
	use:enhance={(input) => {
		// As typed, for the list of what's waiting to be sent; what's sent may be sealed
		typed = new FormData(input.formElement);
		return sealing(sealed, submit, () => sealRow ?? '')(input);
	}}
>
	{@render children()}
	<FormError {error} />
	<StickySubmit
		><SubmitButton pending={submission.pending}>{submitLabel}</SubmitButton></StickySubmit
	>
</form>
