<script lang="ts">
	// Shell for a full-screen group form: error and pending submit button. A form that can
	// wait for the connection (#55) is kept on the device when sending fails for lack of one,
	// and the group shows it until it's through.
	import { enhance, type SubmitFunction } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Block } from 'konsta/svelte';
	import type { Snippet } from 'svelte';
	import FormError from '#lib/components/FormError.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { keep } from '#lib/offline/outbox.ts';

	type Props = {
		error?: ErrorCode;
		submitLabel: string;
		/** The group's token, when this form can wait for the connection */
		offlineToken?: string;
		children: Snippet;
	};

	let { error, submitLabel, offlineToken, children }: Props = $props();

	const submission = new Submission();

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
				const field = (name: string) => String(input.formData.get(name) ?? '');
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
			await after?.(options);
		};
	};
</script>

<form method="POST" action="?/save" use:enhance={submit}>
	{@render children()}
	<FormError {error} />
	<Block>
		<SubmitButton pending={submission.pending}>{submitLabel}</SubmitButton>
	</Block>
</form>
